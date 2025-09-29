'use client';

import { createContext, useContext, useMemo } from 'react';
import { WebBridge } from '@knockdog/bridge-web';

const BridgeContext = createContext<WebBridge | null>(null);

function BridgeProvider({ children }: { children: React.ReactNode }) {
  const bridge = useMemo(() => new WebBridge(), []);

  return <BridgeContext.Provider value={bridge}>{children}</BridgeContext.Provider>;
}

function useBridge() {
  const context = useContext(BridgeContext);
  if (!context) {
    throw new Error('useBridge must be used within a BridgeProvider');
  }
  return context;
}

export { BridgeProvider, useBridge };
