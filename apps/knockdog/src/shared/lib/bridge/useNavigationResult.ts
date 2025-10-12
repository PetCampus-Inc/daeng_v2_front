'use client';

import { useEffect, useRef } from 'react';
import { useBridge, useBridgeContext } from './BridgeProvider';
import { BridgeEventMap, makeId } from '@knockdog/bridge-core';

type NavResultEvent<T = unknown> = {
  txId: string;
  result: T;
};

type NavCancelEvent = {
  txId: string;
  reason?: string;
};

const EVENT_RESULT = 'nav.result' as const;
const EVENT_CANCEL = 'nav.cancel' as const;

function getCurrentTxId(): string | null {
  if (typeof window === 'undefined') return null;

  // 1) history.state._txId
  const st = window.history?.state as { _txId?: string } | null;
  if (st && typeof st._txId === 'string' && st._txId.length > 0) {
    return st._txId;
  }

  // 2) URL ?_txId=...
  const sp = new URLSearchParams(window.location.search);
  const fromQuery = sp.get('_txId');
  if (fromQuery) {
    return fromQuery;
  }

  return null;
}

function useNavigationResult<T>() {
  const bridge = useBridge();
  const { setPendingTxId } = useBridgeContext();
  const settledRef = useRef(false);

  // 컴포넌트 언마운트 시 구독 누수 방지
  const unsubRef = useRef<(() => void)[]>([]);
  useEffect(() => {
    return () => {
      unsubRef.current.forEach((fn) => {
        try {
          fn();
        } catch {}
      });
      unsubRef.current = [];
    };
  }, []);

  /**
   * Stack A: 결과를 기다림 (Promise 1회성)
   * - txId를 생성하고 BridgeProvider에 저장
   * - 다음 navigation.push()가 자동으로 이 txId를 사용
   *
   * @example
   * const resultPromise = navResult.wait();  // 1. wait 먼저 호출
   * await navigation.push({ pathname: '/next-page' });  // 2. push가 txId를 자동으로 사용
   * const result = await resultPromise;  // 3. 결과 기다림
   *
   * @warning wait()는 반드시 push() 이전에 호출해야 합니다!
   */
  const wait = async (timeoutMs: number = 30_000): Promise<T> => {
    settledRef.current = false;

    // txId 생성 및 BridgeProvider에 저장 (다음 push가 자동으로 사용)
    const txId = makeId();
    setPendingTxId(txId);

    return new Promise<T>((resolve, reject) => {
      // 타임아웃 타이머 (결과를 너무 오래 기다리는 경우)
      const timeoutTimer = setTimeout(() => {
        if (settledRef.current) return;
        settledRef.current = true;
        cleanup();
        reject(
          new Error(
            `[useNavigationResult] 응답 타임아웃: ${timeoutMs}ms 내에 send()가 호출되지 않았습니다. (txId: ${txId})`
          )
        );
      }, timeoutMs);

      const offResult = bridge.on(EVENT_RESULT, (payload) => {
        if (settledRef.current) return;
        const data = payload as NavResultEvent<T>;
        // 이 wait()가 기다리는 txId와 일치하는지 확인
        if (data.txId !== txId) return;

        settledRef.current = true;
        clearTimeout(timeoutTimer);
        cleanup();
        resolve(data.result);
      });

      const offCancel = bridge.on(EVENT_CANCEL, (payload) => {
        if (settledRef.current) return;
        const data = payload as NavCancelEvent;
        // 이 wait()가 기다리는 txId와 일치하는지 확인
        if (data.txId !== txId) return;

        settledRef.current = true;
        clearTimeout(timeoutTimer);
        cleanup();
        reject(new Error(data.reason || 'Navigation cancelled'));
      });

      const cleanup = () => {
        try {
          offResult?.();
        } catch {}
        try {
          offCancel?.();
        } catch {}
      };

      // 누수 방지용(언마운트 시)
      unsubRef.current.push(() => {
        clearTimeout(timeoutTimer);
        try {
          offResult?.();
        } catch {}
        try {
          offCancel?.();
        } catch {}
      });
    });
  };

  /**
   * Stack B: 결과 전송
   * - 현재 컨텍스트(히스토리/URL)에서 _txId를 찾아 전송
   */
  const send = (result: T) => {
    const txId = getCurrentTxId();
    console.log('txId', txId);
    if (!txId) {
      const errorMsg =
        '[useNavigationResult.send] _txId not found in history.state or URL\n\n' +
        '가능한 원인:\n' +
        '1. Stack A에서 wait()와 push()의 순서가 잘못됨\n' +
        '   ✅ 올바른 사용:\n' +
        '      const resultPromise = navResult.wait();  // wait 먼저\n' +
        '      await navigation.push({ pathname: "..." });  // push 다음\n' +
        '      const result = await resultPromise;\n\n' +
        '2. navigation.push()에 params가 없고 wait()도 호출하지 않음\n\n' +
        '3. 네이티브 브릿지에서 _txId가 제대로 전달되지 않음';

      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error(errorMsg);
      }

      // 프로덕션에서도 에러 throw (데이터 손실 방지)
      throw new Error('[useNavigationResult.send] _txId를 찾을 수 없습니다.');
    }

    const payload: BridgeEventMap['nav.result'] = { txId, result };
    bridge.emit(EVENT_RESULT, payload);
  };

  /**
   * Stack B (또는 A): 취소 통지
   */
  const cancel = (reason?: string) => {
    const txId = getCurrentTxId();
    if (!txId) {
      const errorMsg =
        '[useNavigationResult.cancel] _txId not found in history.state or URL\n\n' +
        '가능한 원인:\n' +
        '1. Stack A에서 wait()와 push()의 순서가 잘못됨\n' +
        '2. navigation.push()에 params가 없고 wait()도 호출하지 않음';

      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error(errorMsg);
      }

      throw new Error('[useNavigationResult.cancel] _txId를 찾을 수 없습니다.');
    }

    const payload: BridgeEventMap['nav.cancel'] = { txId, reason };
    bridge.emit(EVENT_CANCEL, payload);
  };

  return { wait, send, cancel };
}

export { useNavigationResult };
