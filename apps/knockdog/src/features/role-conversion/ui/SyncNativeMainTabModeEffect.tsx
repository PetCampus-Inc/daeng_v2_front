'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { METHODS } from '@knockdog/bridge-core';

import { useOwnerRole } from '../model/useOwnerRole';
import { useMypageRoleViewStore } from '../model/mypageRoleViewStore';
import { useBridge, useTabNavigation } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';

declare global {
  interface Window {
    __knockdogNativeTabFocused?: boolean;
  }
}

/** 보호자 전용 메인 탭 경로 중, 이 화면에 "있다"는 사실만으로 보호자 선호도를
 * 확정해도 안전한 것만 포함한다. '/'(내 주변)는 원장 콜드스타트 때도 원장 모드가
 * 확정되기 전 네이티브 기본값(guardian)으로 잠깐 거쳐가는 화면이라 여기 넣으면
 * 안 된다 — 넣으면 원장으로 확정되기도 전에 보호자로 영구 고정돼버려서, 원장
 * 계정이 재시작할 때마다 원장 모드로 못 돌아가는 회귀가 생긴다(실제로 발생함).
 * '/save', '/compare'는 첫 진입 기본 탭이 아니라 사용자가 명시적으로 이동해야만
 * 도달하므로 안전하다. */
const GUARDIAN_ONLY_MAIN_PATHS = ['/save', '/compare'];

let lastMainTabModeRequestId = 0;

function getNextMainTabModeRequestId() {
  lastMainTabModeRequestId = Math.max(Date.now(), lastMainTabModeRequestId + 1);
  return lastMainTabModeRequestId;
}

function useHasMypageRoleViewHydrated() {
  const [hasHydrated, setHasHydrated] = useState(
    () => useMypageRoleViewStore.persist?.hasHydrated?.() ?? true
  );

  useEffect(() => {
    if (hasHydrated) return;
    const unsubscribe = useMypageRoleViewStore.persist?.onFinishHydration?.(() => {
      setHasHydrated(true);
    });
    return unsubscribe;
  }, [hasHydrated]);

  return hasHydrated;
}

/** 네이티브가 주입하는 탭 focus — 백그라운드 탭 WebView가 mode를 덮어쓰지 않게 함 */
function useIsNativeTabFocused() {
  const [isFocused, setIsFocused] = useState(() =>
    typeof window !== 'undefined' ? window.__knockdogNativeTabFocused === true : false
  );

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    window.addEventListener('knockdog:native-tab-focus', handleFocus);
    window.addEventListener('knockdog:native-tab-blur', handleBlur);
    setIsFocused(window.__knockdogNativeTabFocused === true);

    return () => {
      window.removeEventListener('knockdog:native-tab-focus', handleFocus);
      window.removeEventListener('knockdog:native-tab-blur', handleBlur);
    };
  }, []);

  return isFocused;
}

/**
 * 원장 권한/뷰 모드에 맞춰 네이티브 바텀탭(보호자 ↔ 원장)을 동기화한다.
 * 웹 BottomNavBar는 네이티브 WebView에서 숨겨지므로 네이티브 탭 전환이 필요하다.
 *
 * Stack 페이지 WebView에서는 동기화하지 않는다.
 * 새 Stack마다 effect가 다시 돌면서 navSetMainTabMode → Tabs navigate가
 * 열린 Stack을 pop해 홈으로 튕기는 문제가 생기기 때문 (예: 템플릿 불러오기).
 *
 * prefersGuardianView는 localStorage persist — 탭별 WebView가 기본값 false로
 * 원장 모드를 다시 밀어 올리는 것을 막는다.
 * /compare 는 보호자 전용이라 항상 guardian 모드로 네이티브 탭을 동기화한다.
 *
 * 단일 writer: focused + visible 메인 탭만 sync.
 * 백그라운드 /compare 등이 guardian으로 덮어 iOS GNB thrash 나는 것을 막는다.
 */
function SyncNativeMainTabModeEffect() {
  const bridge = useBridge();
  const pathname = usePathname();
  const { isMainTab } = useTabNavigation();
  const { isOwner, isResolved, isFetching } = useOwnerRole();
  const prefersGuardianView = useMypageRoleViewStore((state) => state.prefersGuardianView);
  const hasRoleViewHydrated = useHasMypageRoleViewHydrated();
  const isNativeTabFocused = useIsNativeTabFocused();
  const lastSyncedModeRef = useRef<'owner' | 'guardian' | null>(null);
  const retryCountRef = useRef(0);
  const [retryNonce, setRetryNonce] = useState(0);
  const [isDocumentVisible, setIsDocumentVisible] = useState(() =>
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
  );

  const mode = isOwner && !prefersGuardianView ? 'owner' : 'guardian';

  useEffect(() => {
    const handleVisibility = () => {
      setIsDocumentVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    if (!isResolved || !hasRoleViewHydrated) return;
    if (!isMainTab()) return;
    // 네이티브 탭 focus가 소스 오브 트루스. iOS WKWebView는 활성 탭인데도
    // document.visibilityState가 hidden으로 남는 경우가 있어, focus된 탭은
    // visibility와 무관하게 sync한다. 웹은 visibility도 함께 본다.
    if (!isNativeTabFocused) {
      // iOS 실기기에서 네이티브가 blur→focus를 수십ms 간격으로 연달아 두 번
      // 보내는 경우가 있다(원인 미확정). 매번 즉시 리셋하면 그 순간마다
      // "동기화 안 된 상태"로 되돌아가 재동기화 요청이 반복 발사되어 하단
      // 탭이 깜빡인다. blur 직후 곧바로 focus가 돌아오면(포커스가 실제로는
      // 안 바뀐 셈) 리셋을 취소할 수 있도록 짧게 지연시킨다.
      const blurResetTimer = setTimeout(() => {
        lastSyncedModeRef.current = null;
      }, 250);
      return () => clearTimeout(blurResetTimer);
    }
    if (!isNativeWebView() && !isDocumentVisible) {
      lastSyncedModeRef.current = null;
      return;
    }
    // 권한 재조회 중 stale isOwner=false로 보호자 탭으로 내려가지 않도록
    if (mode === 'guardian' && isFetching) return;

    // 보호자 전용 메인 탭 경로는 stale owner store여도 네이티브 탭을 guardian으로 맞춤.
    // 원장 계정이 어떤 경로로 들어왔든(푸시, 알림함, 딥링크 등) 이 화면이 보호자
    // 전용이면 무조건 guardian이어야 하므로, 개별 진입 지점마다 선호도를 챙겨줄
    // 필요 없이 여기 한 곳에서 경로 기준으로 최종 판단한다.
    const isGuardianOnlyPath = GUARDIAN_ONLY_MAIN_PATHS.includes(pathname);
    const syncMode = isGuardianOnlyPath ? 'guardian' : mode;
    if (lastSyncedModeRef.current === syncMode) return;

    // 위 강제와 별개로, 선호도 자체도 영구히 맞춰둔다 — 안 그러면 이 화면을 벗어나
    // 다른 탭으로 이동하는 순간 prefersGuardianView가 여전히 false라 원장으로
    // 되돌아간 것처럼 보인다(진짜 원인은 진입 지점이 선호도를 안 켜준 것).
    // mode === 'owner'는 정확히 isOwner && !prefersGuardianView와 같은 조건이라
    // (94행) 별도로 두 값을 의존성에 추가할 필요가 없다.
    if (isGuardianOnlyPath && mode === 'owner') {
      useMypageRoleViewStore.getState().setPrefersGuardianView(true);
    }

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    // 탭을 빠르게 여러 번 전환하거나 백그라운드→포그라운드 복귀 직후에는
    // isNativeTabFocused/mode/pathname이 짧은 시간에 연속으로 바뀔 수 있다.
    // 매 중간 상태마다 네이티브에 전송하면 여러 WebView가 서로 다른 모드를
    // 경쟁적으로 밀어넣는 핑퐁이 발생하므로, 잠깐 대기해 마지막 상태만 반영한다.
    const debounceTimer = setTimeout(() => {
      if (cancelled) return;

      const retrySync = () => {
        if (cancelled) return;

        if (retryCountRef.current >= 2) {
          // 재시도 상한에 도달했다. 계속 실패해도 매 의존성 변경마다 같은 syncMode를
          // 무한히 재전송하지 않도록, 여기서 포기하고 syncMode로 정착한 것으로 표시한다.
          // mode/pathname 등이 실제로 다시 바뀌면 그때 새로 동기화가 시도된다.
          lastSyncedModeRef.current = syncMode;
          return;
        }

        retryCountRef.current += 1;
        retryTimer = setTimeout(() => {
          setRetryNonce((nonce) => nonce + 1);
        }, 300);
      };

      bridge
        .request(METHODS.navSetMainTabMode, {
          mode: syncMode,
          requestId: getNextMainTabModeRequestId(),
          // 탭 focus로 활성 WebView임을 확인했으므로, 시작 직후 ref 등록 전에도 적용한다.
          force: true,
        })
        .then(({ mode: appliedMode }) => {
          if (cancelled) return;
          // 브리지가 실제로 반영한 뒤에만 기록한다. 요청 전에 미리 기록해두면, effect가
          // 도중에(예: isFetching 변경으로) 취소돼 실제로는 반영이 안 됐는데도 다음
          // 재실행에서 "이미 동기화됨"으로 오판해 재시도를 건너뛰게 된다.
          // 앱 시작 직후에는 활성 WebView 등록 전 요청이 무시될 수 있다.
          // 그 경우 네이티브가 유지한 기존 모드가 응답되므로 재시도한다.
          if (appliedMode === syncMode) {
            lastSyncedModeRef.current = syncMode;
          } else {
            retrySync();
          }
        })
        .catch((error) => {
          if (cancelled) return;
          if (process.env.NODE_ENV === 'development') {
            console.warn('[SyncNativeMainTabModeEffect] failed to sync main tab mode', error);
          }
          retrySync();
        });
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(debounceTimer);
      if (retryTimer !== undefined) clearTimeout(retryTimer);
    };
  }, [
    bridge,
    hasRoleViewHydrated,
    isDocumentVisible,
    isFetching,
    isMainTab,
    isNativeTabFocused,
    isResolved,
    mode,
    pathname,
    retryNonce,
  ]);

  useEffect(() => {
    if (isNativeTabFocused && (isDocumentVisible || isNativeWebView())) {
      retryCountRef.current = 0;
    }
  }, [isDocumentVisible, isNativeTabFocused]);

  return null;
}

export { SyncNativeMainTabModeEffect };
