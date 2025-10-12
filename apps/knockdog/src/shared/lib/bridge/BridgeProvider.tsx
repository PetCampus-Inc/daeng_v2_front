'use client';

import { createContext, useContext, useMemo, useCallback, useRef } from 'react';
import { WebBridge } from '@knockdog/bridge-web';

interface BridgeContextValue {
  bridge: WebBridge;
  setPendingTxId: (txId: string | null) => void;
  consumePendingTxId: () => string | null;
}

const BridgeContext = createContext<BridgeContextValue | null>(null);

// wait() 후 push()를 호출하지 않으면 에러를 발생시키는 타이머 (개발 모드)
const PENDING_TIMEOUT = 5_000; // 5초

function BridgeProvider({ children }: { children: React.ReactNode }) {
  const bridge = useMemo(() => new WebBridge(), []);
  const pendingTxIdRef = useRef<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setPendingTxId = useCallback((txId: string | null) => {
    // 기존 타이머 정리
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    pendingTxIdRef.current = txId;

    // txId가 설정되면 타이머 시작 (개발 모드에서만)
    if (txId && process.env.NODE_ENV !== 'production') {
      timeoutRef.current = setTimeout(() => {
        console.error(
          '[useNavigationResult] wait()를 호출한 후 5초 내에 navigation.push()가 호출되지 않았습니다.\n' +
            '올바른 사용법:\n' +
            '  const resultPromise = navResult.wait();  // 1. wait 먼저\n' +
            '  await navigation.push({ pathname: "..." });  // 2. push\n' +
            '  const result = await resultPromise;  // 3. 결과 기다림'
        );
        // 타임아웃된 pendingTxId 정리
        pendingTxIdRef.current = null;
      }, PENDING_TIMEOUT);
    }
  }, []);

  const consumePendingTxId = useCallback(() => {
    // 타이머 정리
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const txId = pendingTxIdRef.current;
    if (txId) {
      pendingTxIdRef.current = null;
    }
    return txId;
  }, []);

  const value = useMemo(
    () => ({
      bridge,
      setPendingTxId,
      consumePendingTxId,
    }),
    [bridge, setPendingTxId, consumePendingTxId]
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

function useBridgeContext() {
  const context = useContext(BridgeContext);
  if (!context) {
    throw new Error('useBridgeContext must be used within a BridgeProvider');
  }
  return context;
}

export { BridgeProvider, useBridge, useBridgeContext };
