import type { WebViewMessageEvent } from 'react-native-webview';

import { isExternalWebViewUrl } from './isFirstPartyWebViewUrl';
import { navigationRef, isNavReady } from './navigationRef';

const NATIVE_BACK_UNHANDLED_TYPE = 'knockdog:native-back-unhandled';

/**
 * Stack 화면에서 안드로이드 뒤로가기를 웹이 소비하지 않으면 네이티브 goBack.
 * 외부 origin 메시지는 무시. 루트 Stack(canGoBack=false)이면 Tabs로 복귀.
 */
function handleNativeBackUnhandledMessage(event: WebViewMessageEvent): boolean {
  try {
    const data = JSON.parse(event.nativeEvent.data) as { type?: string } | null;
    if (!data || data.type !== NATIVE_BACK_UNHANDLED_TYPE) return false;

    // 외부 페이지가 브릿지/back 메시지를 흉내 내지 못하도록
    if (isExternalWebViewUrl(event.nativeEvent.url)) return true;

    if (!isNavReady()) return true;

    if (navigationRef.canGoBack()) {
      navigationRef.goBack();
      return true;
    }

    // Tabs→Stack replace 등으로 스택 루트에 갇히지 않도록
    navigationRef.navigate('Tabs');
    return true;
  } catch {
    return false;
  }
}

export { handleNativeBackUnhandledMessage, NATIVE_BACK_UNHANDLED_TYPE };
