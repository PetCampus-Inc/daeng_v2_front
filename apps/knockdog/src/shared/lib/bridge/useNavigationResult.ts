'use client';

import { useBridge } from './BridgeProvider';
import { BridgeEventMap } from '@knockdog/bridge-core';
import { isNativeWebView } from '@shared/lib/device';

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

  /**
   * Stack B: 결과 전송
   * - 현재 컨텍스트(히스토리/URL)에서 _txId를 찾아 전송
   */
  const send = (result: T) => {
    const txId = getCurrentTxId();

    if (!txId) {
      const errorMsg =
        '[useNavigationResult.send] _txId not found in history.state or URL\n\n' +
        '가능한 원인:\n' +
        '1. Stack A에서 pushForResult()를 호출하지 않음\n' +
        '   ✅ 올바른 사용:\n' +
        '      // Stack A (부모)\n' +
        '      const result = await navigation.pushForResult({ pathname: "..." });\n\n' +
        '      // Stack B (자식)\n' +
        '      navResult.send(data);\n\n' +
        '2. 네이티브 브릿지에서 _txId가 제대로 전달되지 않음';

      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error(errorMsg);
      }

      // 프로덕션에서도 에러 throw (데이터 손실 방지)
      throw new Error('[useNavigationResult.send] _txId를 찾을 수 없습니다.');
    }

    // result가 직렬화 가능한지 검증
    let serializedResult: string;
    try {
      serializedResult = JSON.stringify({ ok: true, result });
    } catch (err) {
      throw new Error('[useNavigationResult.send] result를 직렬화할 수 없습니다.');
    }

    // 웹 환경에서는 sessionStorage에 저장
    if (typeof window !== 'undefined' && !isNativeWebView()) {
      sessionStorage.setItem(`nav_result_${txId}`, serializedResult);
      return;
    }

    // 네이티브 환경에서는 브릿지로 전송
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
        '1. Stack A에서 pushForResult()를 호출하지 않음\n' +
        '2. 네이티브 브릿지에서 _txId가 제대로 전달되지 않음';

      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error(errorMsg);
      }

      throw new Error('[useNavigationResult.cancel] _txId를 찾을 수 없습니다.');
    }

    // reason이 직렬화 가능한지 검증
    let serializedPayload: string;
    try {
      serializedPayload = JSON.stringify({ ok: false, reason });
    } catch (err) {
      throw new Error('[useNavigationResult.cancel] reason을 직렬화할 수 없습니다.');
    }

    // 웹 환경에서는 sessionStorage에 저장
    if (typeof window !== 'undefined' && !isNativeWebView()) {
      sessionStorage.setItem(`nav_result_${txId}`, serializedPayload);
      return;
    }

    // 네이티브 환경에서는 브릿지로 전송
    const payload: BridgeEventMap['nav.cancel'] = { txId, reason };
    bridge.emit(EVENT_CANCEL, payload);
  };

  return { send, cancel };
}

export { useNavigationResult };
