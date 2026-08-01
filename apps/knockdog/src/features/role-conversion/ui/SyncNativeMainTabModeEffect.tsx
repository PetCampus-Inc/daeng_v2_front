'use client';

import { useEffect, useMemo, useRef } from 'react';
import { METHODS } from '@knockdog/bridge-core';

import { useOwnerRole } from '../model/useOwnerRole';
import { useMypageRoleViewStore } from '../model/mypageRoleViewStore';
import { useBridge } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';

/**
 * 원장 권한/뷰 모드에 맞춰 네이티브 바텀탭(보호자 ↔ 원장)을 동기화한다.
 * 웹 BottomNavBar는 네이티브 WebView에서 숨겨지므로 네이티브 탭 전환이 필요하다.
 */
function SyncNativeMainTabModeEffect() {
  const bridge = useBridge();
  const isNative = useMemo(() => isNativeWebView(), []);
  const { isOwner, isResolved, isFetching } = useOwnerRole();
  const prefersGuardianView = useMypageRoleViewStore((state) => state.prefersGuardianView);
  const lastSyncedModeRef = useRef<'owner' | 'guardian' | null>(null);

  const mode = isOwner && !prefersGuardianView ? 'owner' : 'guardian';

  useEffect(() => {
    if (!isNative || !isResolved) return;
    // 권한 재조회 중 stale isOwner=false로 보호자 탭으로 내려가지 않도록
    if (mode === 'guardian' && isFetching) return;
    if (lastSyncedModeRef.current === mode) return;

    lastSyncedModeRef.current = mode;

    bridge.request(METHODS.navSetMainTabMode, { mode }).catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[SyncNativeMainTabModeEffect] failed to sync main tab mode', error);
      }
      lastSyncedModeRef.current = null;
    });
  }, [bridge, isFetching, isNative, isResolved, mode]);

  return null;
}

export { SyncNativeMainTabModeEffect };
