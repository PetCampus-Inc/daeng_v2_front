'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { METHODS } from '@knockdog/bridge-core';

import { useOwnerRole } from '../model/useOwnerRole';
import { useMypageRoleViewStore } from '../model/mypageRoleViewStore';
// TEMP DEBUG: 원장/보호자 깜빡임 원인 파악용. 확인 끝나면 제거.
import { isRoleFlickerDebugUser, pushRoleFlickerDebugLog, useRoleFlickerDebugLogStore } from '../model/roleFlickerDebugLogStore';
import { useBridge, useTabNavigation } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';

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
  const isDebugUser = isRoleFlickerDebugUser();
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

  // TEMP DEBUG: 원장/보호자 깜빡임 원인 파악용. 확인 끝나면 제거.
  const debugLog = useRoleFlickerDebugLogStore((state) => state.lines);
  const pushDebugLog = pushRoleFlickerDebugLog;

  useEffect(() => {
    const handleVisibility = () => {
      setIsDocumentVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    pushDebugLog(
      `effect run: mode=${mode} isOwner=${isOwner} prefersGuardian=${prefersGuardianView} ` +
        `isResolved=${isResolved} isFetching=${isFetching} ` +
        `hydrated=${hasRoleViewHydrated} focused=${isNativeTabFocused} visible=${isDocumentVisible} ` +
        `path=${pathname} last=${lastSyncedModeRef.current}`
    );
    if (!isResolved || !hasRoleViewHydrated) {
      pushDebugLog('  -> skip: not resolved/hydrated');
      return;
    }
    if (!isMainTab()) {
      pushDebugLog('  -> skip: not main tab');
      return;
    }
    // 네이티브 탭 focus가 소스 오브 트루스. iOS WKWebView는 활성 탭인데도
    // document.visibilityState가 hidden으로 남는 경우가 있어, focus된 탭은
    // visibility와 무관하게 sync한다. 웹은 visibility도 함께 본다.
    if (!isNativeTabFocused) {
      // iOS 실기기에서 네이티브가 blur→focus를 수십ms 간격으로 연달아 두 번
      // 보내는 경우가 있다(원인 미확정). 매번 즉시 리셋하면 그 순간마다
      // "동기화 안 된 상태"로 되돌아가 재동기화 요청이 반복 발사되어 하단
      // 탭이 깜빡인다. blur 직후 곧바로 focus가 돌아오면(포커스가 실제로는
      // 안 바뀐 셈) 리셋을 취소할 수 있도록 짧게 지연시킨다.
      pushDebugLog('  -> skip: not native-tab-focused, scheduling reset (debounced)');
      const blurResetTimer = setTimeout(() => {
        pushDebugLog('  -> blur-debounce elapsed, reset last=null');
        lastSyncedModeRef.current = null;
      }, 250);
      return () => clearTimeout(blurResetTimer);
    }
    if (!isNativeWebView() && !isDocumentVisible) {
      pushDebugLog('  -> skip: web + not visible, reset last=null');
      lastSyncedModeRef.current = null;
      return;
    }
    // 권한 재조회 중 stale isOwner=false로 보호자 탭으로 내려가지 않도록
    if (mode === 'guardian' && isFetching) {
      pushDebugLog('  -> skip: guardian while fetching (stale isOwner=false 방지)');
      return;
    }

    // 보호자 유치원 탭은 stale owner store여도 네이티브 탭을 guardian으로 맞춤
    const syncMode = pathname === '/compare' ? 'guardian' : mode;
    if (lastSyncedModeRef.current === syncMode) {
      pushDebugLog(`  -> skip: already synced to ${syncMode}`);
      return;
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
          pushDebugLog(`  retry limit reached, settle as ${syncMode}`);
          lastSyncedModeRef.current = syncMode;
          return;
        }

        retryCountRef.current += 1;
        pushDebugLog(`  retry #${retryCountRef.current} scheduled`);
        retryTimer = setTimeout(() => {
          setRetryNonce((nonce) => nonce + 1);
        }, 300);
      };

      pushDebugLog(`  -> SEND navSetMainTabMode(${syncMode})`);
      bridge
        .request(METHODS.navSetMainTabMode, {
          mode: syncMode,
          requestId: getNextMainTabModeRequestId(),
          // 탭 focus로 활성 WebView임을 확인했으므로, 시작 직후 ref 등록 전에도 적용한다.
          force: true,
        })
        .then(({ mode: appliedMode }) => {
          if (cancelled) return;
          pushDebugLog(`  <- RESP applied=${appliedMode} (requested=${syncMode})`);
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
          pushDebugLog(`  <- ERROR ${error instanceof Error ? error.message : String(error)}`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pushDebugLog(TEMP DEBUG)는 매 렌더 재생성되는 순수 로깅 함수라 의존성 추가 시 의도치 않게 재실행 빈도만 바뀜
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

  // TEMP DEBUG: 원장/보호자 깜빡임 원인 파악용. 지정 계정에서만 노출. 확인 끝나면 제거.
  if (!isDebugUser) return null;

  return (
    <pre
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        maxHeight: '45vh',
        overflow: 'hidden',
        fontSize: 9,
        lineHeight: 1.3,
        background: 'rgba(0,0,0,0.85)',
        color: '#0f0',
        padding: 6,
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        pointerEvents: 'none',
      }}
    >
      {`mode=${mode} prefersGuardian=${prefersGuardianView} isOwner=${isOwner}\n` + debugLog.join('\n')}
    </pre>
  );
}

export { SyncNativeMainTabModeEffect };
