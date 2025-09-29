import { useBridge } from '@shared/lib/bridge';
import { useCallback } from 'react';
import { isNativeWebView } from './isNativeWebView';
import { METHODS, BridgeException } from '@knockdog/bridge-core';

type CopyToClipboardResult = { copied: boolean };

async function copyWithWeb(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (error) {
    console.error('[WEBVIEW] copyWithWeb error', error);
    return false;
  }

  // 레거시 execCommand 폴백
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', 'true');
    el.style.position = 'fixed';
    el.style.top = '-9999px';
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, el.value.length);
    const ok = document.execCommand('copy'); // 일부 브라우저/환경에서만 동작
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/**
 * 클립보드 복사 훅 - 네이티브 브릿지 우선 -> 실패 시 웹 풀백
 * const copy = useClipboardCopy();
 * await copy('test');
 */
function useClipboardCopy() {
  const bridge = useBridge();

  return useCallback(
    async function copy(text: string): Promise<boolean> {
      if (!text || text.length === 0) {
        return false;
      }

      if (isNativeWebView()) {
        try {
          const response = await bridge.request<CopyToClipboardResult>(METHODS.copyToClipboard, { text });

          if (response?.copied) {
            return true;
          }
        } catch (error) {
          if (error instanceof BridgeException) {
            const code = error?.code;
            const message = error?.message || String(error);
            console.error('[WEBVIEW] Bridge error - code:', code, 'message:', message);

            if (code === 'EUNAVAILABLE') {
              return false;
            }
          }
        }
      }

      return copyWithWeb(text);
    },
    [bridge]
  );
}

export { useClipboardCopy };
