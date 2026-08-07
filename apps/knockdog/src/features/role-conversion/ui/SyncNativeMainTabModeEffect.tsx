'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { METHODS } from '@knockdog/bridge-core';

import { useOwnerRole } from '../model/useOwnerRole';
import { useMypageRoleViewStore } from '../model/mypageRoleViewStore';
import { useBridge, useTabNavigation } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';

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
 */
function SyncNativeMainTabModeEffect() {
  const bridge = useBridge();
  const pathname = usePathname();
  const isNative = useMemo(() => isNativeWebView(), []);
  const { isMainTab } = useTabNavigation();
  const { isOwner, isResolved, isFetching } = useOwnerRole();
  const prefersGuardianView = useMypageRoleViewStore((state) => state.prefersGuardianView);
  const hasRoleViewHydrated = useHasMypageRoleViewHydrated();
  const lastSyncedModeRef = useRef<'owner' | 'guardian' | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const mode = isOwner && !prefersGuardianView ? 'owner' : 'guardian';

  useEffect(() => {
    if (!isNative || !isResolved || !hasRoleViewHydrated) return;
    if (!isMainTab()) return;
    // 권한 재조회 중 stale isOwner=false로 보호자 탭으로 내려가지 않도록
    if (mode === 'guardian' && isFetching) return;

    // 보호자 유치원 탭은 stale owner store여도 네이티브 탭을 guardian으로 맞춤
    const syncMode = pathname === '/compare' ? 'guardian' : mode;
    if (lastSyncedModeRef.current === syncMode) return;

    lastSyncedModeRef.current = syncMode;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    bridge.request(METHODS.navSetMainTabMode, { mode: syncMode }).catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[SyncNativeMainTabModeEffect] failed to sync main tab mode', error);
      }
      lastSyncedModeRef.current = null;
      if (cancelled) return;
      // mode가 그대로여도 effect가 다시 돌도록 retry state bump
      retryTimer = setTimeout(() => {
        setRetryNonce((nonce) => nonce + 1);
      }, 300);
    });

    return () => {
      cancelled = true;
      if (retryTimer !== undefined) clearTimeout(retryTimer);
    };
  }, [
    bridge,
    hasRoleViewHydrated,
    isFetching,
    isMainTab,
    isNative,
    isResolved,
    mode,
    pathname,
    retryNonce,
  ]);

  return null;
}

export { SyncNativeMainTabModeEffect };
