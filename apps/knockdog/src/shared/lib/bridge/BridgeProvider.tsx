'use client';

import { createContext, useContext, useMemo } from 'react';
import { WebBridge } from '@knockdog/bridge-web';

interface BridgeContextValue {
  bridge: WebBridge;
}

const BridgeContext = createContext<BridgeContextValue | null>(null);

// 전역 bridge 인스턴스 (hook 없이 접근 가능)
let globalBridgeInstance: WebBridge | null = null;

function BridgeProvider({ children }: { children: React.ReactNode }) {
  const bridge = useMemo(() => {
    if (!globalBridgeInstance) {
      globalBridgeInstance = new WebBridge();
    }
    return globalBridgeInstance;
  }, []);

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

/**
 * hook 없이 bridge 인스턴스에 접근 (컴포넌트 외부에서 사용)
 * BridgeProvider가 마운트되기 전에는 null 반환
 */
function getBridgeInstance(): WebBridge | null {
  return globalBridgeInstance;
}

export { BridgeProvider, useBridge, getBridgeInstance };
