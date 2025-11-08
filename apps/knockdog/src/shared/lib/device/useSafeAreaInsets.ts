import { useEffect, useState } from 'react';
import { BridgeException, METHODS, type SafeAreaInsets } from '@knockdog/bridge-core';
import { useBridge } from '../bridge';
import { isNativeWebView } from './isNativeWebView';

export function useSafeAreaInsets() {
  const bridge = useBridge();
  const [insets, setInsets] = useState<SafeAreaInsets>({ top: 0, bottom: 0, left: 0, right: 0 });

  useEffect(() => {
    if (!isNativeWebView()) return;

    async function fetchInsets() {
      try {
        const response = await bridge.request(METHODS.getSafeAreaInsets, {});
        setInsets(response);
      } catch (error) {
        if (error instanceof BridgeException) {
          const code = error?.code;
          const message = error?.message || String(error);
          console.error('[WEBVIEW] Bridge error - code:', code, 'message:', message);
        }
      }
    }

    fetchInsets();
  }, [bridge]);

  return insets;
}
