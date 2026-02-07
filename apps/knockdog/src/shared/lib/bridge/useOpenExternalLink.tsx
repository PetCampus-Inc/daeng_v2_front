'use client';

import { useCallback, useMemo } from 'react';
import { useBridge } from './BridgeProvider';
import { isNativeWebView } from '@shared/lib/device';

function useOpenExternalLink() {
  const bridge = useBridge();

  const isNative = useMemo(() => isNativeWebView(), []);

  if (isNative) {
    return useCallback(
      function openExternalLink(url: string) {
        bridge.emit("system.openExternalLink", { url });
      },
      [bridge]
    );
  }

  // web fallback
  return useCallback(async function openExternalLink(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);
}

export { useOpenExternalLink };
