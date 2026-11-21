'use client';

import { useEffect } from 'react';
import { METHODS } from '@knockdog/bridge-core';

import { isNativeWebView } from '@shared/lib/device';

import { useBridge } from './BridgeProvider';

let lastRequestId = 0;

const useNativeTabBarDim = (isDimmed: boolean) => {
  const bridge = useBridge();

  useEffect(() => {
    if (!isDimmed || !isNativeWebView()) return;

    const setDimmed = (dimmed: boolean) => {
      lastRequestId = Math.max(Date.now(), lastRequestId + 1);
      void bridge.request(METHODS.navSetBottomTabBarDimmed, { dimmed, requestId: lastRequestId }).catch(() => {
        // Older app builds may not implement the RPC. The WebView backdrop remains available.
      });
    };
    const handleResume = () => setDimmed(true);

    setDimmed(true);
    window.addEventListener('appresume', handleResume);

    return () => {
      window.removeEventListener('appresume', handleResume);
      setDimmed(false);
    };
  }, [bridge, isDimmed]);
};

export { useNativeTabBarDim };
