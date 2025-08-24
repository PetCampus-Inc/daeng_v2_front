// @file: /apps/knockdog/app/_bridge/listener.ts
'use client';
import { useEffect } from 'react';
// eslint-disable-next-line fsd/no-global-store-imports
import { useBridgeStore } from '@shared/store/useBridgeStore';

export function useBridgeListener() {
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      try {
        const data =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        const { type, payload } = data ?? {};
        useBridgeStore.setState({ lastReceivedType: type, payload });
        useBridgeStore.getState().addLog({
          dir: 'in',
          type,
          payload,
          time: Date.now(),
        });
        if (type === 'ping') {
          useBridgeStore
            .getState()
            .sendBridgeMessage?.('pong', { from: 'web' });
        }
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);
}
