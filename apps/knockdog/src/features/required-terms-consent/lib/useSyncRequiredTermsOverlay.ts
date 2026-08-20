'use client';

import { useEffect, useMemo } from 'react';
import { METHODS } from '@knockdog/bridge-core';

import { useBridge } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';

import { useRequiredTermsConsentOverlayStore } from '../model/requiredTermsConsentOverlayStore';

/** 약관 오버레이 노출 중 하단 탭(웹/네이티브)을 숨긴다. */
function useSyncRequiredTermsOverlay(isOpen: boolean) {
  const bridge = useBridge();
  const isNative = useMemo(() => isNativeWebView(), []);
  const setBlockingOverlayOpen = useRequiredTermsConsentOverlayStore((state) => state.setBlockingOverlayOpen);

  useEffect(() => {
    setBlockingOverlayOpen(isOpen);

    if (isNative) {
      bridge.request(METHODS.navSetBottomTabBarVisible, { visible: !isOpen }).catch(() => undefined);
    }

    return () => {
      setBlockingOverlayOpen(false);
      if (isNative) {
        bridge.request(METHODS.navSetBottomTabBarVisible, { visible: true }).catch(() => undefined);
      }
    };
  }, [bridge, isNative, isOpen, setBlockingOverlayOpen]);
}

export { useSyncRequiredTermsOverlay };
