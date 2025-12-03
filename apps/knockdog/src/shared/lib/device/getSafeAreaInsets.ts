import { BridgeException, METHODS, type SafeAreaInsets } from '@knockdog/bridge-core';
import { getBridgeInstance } from '../bridge';
import { isNativeWebView } from './isNativeWebView';

/**
 * Safe Area Insets 가져오기
 * @description 앱 환경에서만 사용 가능
 */
export async function getSafeAreaInsets(): Promise<SafeAreaInsets> {
  if (!isNativeWebView()) {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const bridge = getBridgeInstance();

  if (!bridge) {
    throw new Error('Bridge not initialized');
  }

  try {
    return await bridge.request<SafeAreaInsets>(METHODS.getSafeAreaInsets, {});
  } catch (error) {
    if (error instanceof BridgeException) {
      const code = error?.code;
      const message = error?.message || String(error);
      console.error('[WEBVIEW] Bridge error - code:', code, 'message:', message);
    }
    throw error;
  }
}
