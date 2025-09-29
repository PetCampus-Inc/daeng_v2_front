import { useCallback } from 'react';
import { useBridge } from '@shared/lib/bridge';
import { isNativeWebView } from './isNativeWebView';
import { type CallPhoneResult, METHODS, BridgeException } from '@knockdog/bridge-core';

function openWithBrowserTel(phoneNumber: string): boolean {
  try {
    // WebView에서는 tel: 스키마를 직접 사용할 수 없으므로
    // 브라우저 환경에서만 사용
    if (!isNativeWebView()) {
      window.location.href = `tel:${phoneNumber}`;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function normalizeTel(phoneNumber: string): string {
  return phoneNumber.replace(/[^0-9]/g, '');
}

/**
 * 전화걸기 훅 - 브릿지 우선 -> 실패 시 브라우저 tel: 링크 콜백
 */
function useCallPhone() {
  const bridge = useBridge();

  return useCallback(
    async function callPhone(phoneNumber: string): Promise<boolean> {
      const normalizedPhoneNumber = normalizeTel(phoneNumber);

      if (isNativeWebView()) {
        try {
          const requestParams = { phoneNumber: normalizedPhoneNumber };

          const response = await bridge.request<CallPhoneResult>(METHODS.callPhone, requestParams);

          if (response?.opened) {
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
        return openWithBrowserTel(normalizedPhoneNumber);
      }

      return openWithBrowserTel(normalizedPhoneNumber);
    },
    [bridge]
  );
}

export { useCallPhone };
