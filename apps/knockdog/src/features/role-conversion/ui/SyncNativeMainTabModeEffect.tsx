'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { METHODS } from '@knockdog/bridge-core';

import { useOwnerRole } from '../model/useOwnerRole';
import { useMypageRoleViewStore } from '../model/mypageRoleViewStore';
import { useBridge, useTabNavigation } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';

/**
 * 원장 권한/뷰 모드에 맞춰 네이티브 바텀탭(보호자 ↔ 원장)을 동기화한다.
 * 웹 BottomNavBar는 네이티브 WebView에서 숨겨지므로 네이티브 탭 전환이 필요하다.
 *
 * Stack 페이지 WebView에서는 동기화하지 않는다.
 * 새 Stack마다 effect가 다시 돌면서 navSetMainTabMode → Tabs navigate가
 * 열린 Stack을 pop해 홈으로 튕기는 문제가 생기기 때문 (예: 템플릿 불러오기).
 */
function SyncNativeMainTabModeEffect() {
  const bridge = useBridge();
  const isNative = useMemo(() => isNativeWebView(), []);
  const { isMainTab } = useTabNavigation();
  const { isOwner, isResolved, isFetching } = useOwnerRole();
  const prefersGuardianView = useMypageRoleViewStore((state) => state.prefersGuardianView);
  const lastSyncedModeRef = useRef<'owner' | 'guardian' | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const mode = isOwner && !prefersGuardianView ? 'owner' : 'guardian';

  useEffect(() => {
    if (!isNative || !isResolved) return;
    if (!isMainTab()) return;
    // 권한 재조회 중 stale isOwner=false로 보호자 탭으로 내려가지 않도록
    if (mode === 'guardian' && isFetching) return;
    if (lastSyncedModeRef.current === mode) return;

    lastSyncedModeRef.current = mode;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    bridge.request(METHODS.navSetMainTabMode, { mode }).catch((error) => {
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
  }, [bridge, isFetching, isMainTab, isNative, isResolved, mode, retryNonce]);

  return null;
}

export { SyncNativeMainTabModeEffect };
