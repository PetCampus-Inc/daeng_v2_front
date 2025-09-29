import { useBridge } from '@shared/lib/bridge';
import { useCallback } from 'react';
import { METHODS, BridgeException, type ShareParams, type ShareResult } from '@knockdog/bridge-core';
import { isNativeWebView } from './isNativeWebView';

function useShare() {
  const bridge = useBridge();

  return useCallback(async function share(params: ShareParams): Promise<boolean> {
    if (isNativeWebView()) {
      try {
        const response = await bridge.request<ShareResult>(METHODS.share, params, { timeoutMs: 999_999 });

        if (response?.shared) {
          return true;
        }
      } catch (error) {
        if (error instanceof BridgeException) {
          const code = error?.code;
          const message = error?.message || String(error);
          console.error('[WEBVIEW] Bridge error - code:', code, 'message:', message);
        }
      }
    }

    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        const payload: { url?: string; title?: string; text?: string } = {};

        // 제목 설정 (iOS의 subject 또는 Android의 title 우선)
        if (params.subject) {
          payload.title = params.subject;
        } else if (params.title) {
          payload.title = params.title;
        }

        // URL 설정
        if (params.url) {
          payload.url = params.url;
        }

        // 메시지 설정
        if (params.message) {
          payload.text = params.message;
        }

        const canShare =
          typeof (navigator as any).canShare === 'function' ? (navigator as any).canShare(payload) : true;

        if (!canShare) {
          console.warn('[WEB] navigator.canShare(payload) === false');
          return false;
        }

        await (navigator as any).share(payload);

        return true;
      } catch (error) {
        if ((error as any)?.name === 'AbortError') {
          return false;
        }

        console.error('[WEBVIEW] share error', error);
        return false;
      }
    }

    return false;
  }, []);
}

export { useShare };
