'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { METHODS } from '@knockdog/bridge-core';

import { useOwnerRole } from '../model/useOwnerRole';
import { useMypageRoleViewStore } from '../model/mypageRoleViewStore';
import { useBridge, useTabNavigation } from '@shared/lib/bridge';

declare global {
  interface Window {
    __knockdogNativeTabFocused?: boolean;
  }
}

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
    if (!isNativeTabFocused || !isDocumentVisible) {
      lastSyncedModeRef.current = null;
      return;
    }
    // 권한 재조회 중에는 mode가 어느 쪽이든 stale한 중간 상태일 수 있으므로
    // 재조회가 끝나 값이 확정될 때까지 네이티브 동기화를 보류한다.
    if (isFetching) return;

    // 보호자 유치원 탭은 stale owner store여도 네이티브 탭을 guardian으로 맞춤
    const syncMode = pathname === '/compare' ? 'guardian' : mode;
    if (lastSyncedModeRef.current === syncMode) return;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    // 탭을 빠르게 여러 번 전환하거나 백그라운드→포그라운드 복귀 직후에는
    // isNativeTabFocused/mode/pathname이 짧은 시간에 연속으로 바뀔 수 있다.
    // 매 중간 상태마다 네이티브에 전송하면 여러 WebView가 서로 다른 모드를
    // 경쟁적으로 밀어넣는 핑퐁이 발생하므로, 잠깐 대기해 마지막 상태만 반영한다.
    const debounceTimer = setTimeout(() => {
      if (cancelled) return;

      const retrySync = () => {
        if (cancelled || retryCountRef.current >= 2) return;

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
    if (isNativeTabFocused && isDocumentVisible) {
      retryCountRef.current = 0;
    }
  }, [isDocumentVisible, isNativeTabFocused]);

  return null;
}

export { SyncNativeMainTabModeEffect };
