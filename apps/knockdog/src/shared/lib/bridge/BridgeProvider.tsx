'use client';

import { createContext, useContext, useMemo } from 'react';
import { WebBridge } from '@knockdog/bridge-web';

interface BridgeContextValue {
  bridge: WebBridge;
}

const BridgeContext = createContext<BridgeContextValue | null>(null);

function BridgeProvider({ children }: { children: React.ReactNode }) {
  const bridge = useMemo(() => new WebBridge(), []);

  const value = useMemo(
    () => ({
      bridge,
    }),
    [bridge]
  );

  return <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>;
}

function useBridge() {
  const context = useContext(BridgeContext);
  if (!context) {
    throw new Error('useBridge must be used within a BridgeProvider');
  }
  return context.bridge;
}

export { BridgeProvider, useBridge };
