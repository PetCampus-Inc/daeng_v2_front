import type { WebViewMessageEvent } from 'react-native-webview';

import { navigationRef, isNavReady } from './navigationRef';

const NATIVE_BACK_UNHANDLED_TYPE = 'knockdog:native-back-unhandled';

/**
 * Stack 화면에서 안드로이드 뒤로가기를 웹이 소비하지 않으면 네이티브 goBack.
 */
function handleNativeBackUnhandledMessage(event: WebViewMessageEvent): boolean {
  try {
    const data = JSON.parse(event.nativeEvent.data) as { type?: string } | null;
    if (!data || data.type !== NATIVE_BACK_UNHANDLED_TYPE) return false;

    if (isNavReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
    return true;
  } catch {
    return false;
  }
}

export { handleNativeBackUnhandledMessage, NATIVE_BACK_UNHANDLED_TYPE };
