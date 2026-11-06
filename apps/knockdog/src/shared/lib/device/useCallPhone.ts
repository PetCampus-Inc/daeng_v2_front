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
  const trimmed = phoneNumber.trim();
  const hasPlusPrefix = trimmed.startsWith('+');
  const cleaned = trimmed.replace(/[^\d*#\+]/g, '');

  if (hasPlusPrefix) {
    return `+${cleaned}`;
  }
  return cleaned;
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
          // opened가 false이거나 undefined인 경우
          console.error('[WEBVIEW] Bridge returned opened: false', response);
          return false;
        } catch (error) {
          if (error instanceof BridgeException) {
            const code = error?.code;
            const message = error?.message || String(error);
            console.error('[WEBVIEW] Bridge error - code:', code, 'message:', message);

            // WebView에서는 tel: 스키마를 사용할 수 없으므로
            // 모든 에러에 대해 false 반환
            return false;
          }
          // BridgeException이 아닌 다른 에러
          console.error('[WEBVIEW] Unexpected error:', error);
          return false;
        }
      }

      return openWithBrowserTel(normalizedPhoneNumber);
    },
    [bridge]
  );
}

export { useCallPhone };
