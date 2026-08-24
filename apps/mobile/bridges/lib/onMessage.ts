import type { WebViewMessageEvent } from 'react-native-webview';
import { handleConsoleMessage } from './consoleOnMessage';
import { isExternalWebViewUrl } from './isFirstPartyWebViewUrl';
import { handleNativeBackUnhandledMessage } from './nativeBackOnMessage';

/**
 * WebView에서 메시지를 받아서 처리하는 함수
 * @param onMessage
 */
function makeOnMessage(onMessage: (event: WebViewMessageEvent) => void) {
  return (event: WebViewMessageEvent) => {
    // 외부 origin → 브릿지 요청/이벤트·native-back 무시 (콘솔 패치만 허용)
    if (isExternalWebViewUrl(event.nativeEvent.url)) {
      handleConsoleMessage(event);
      return;
    }

    if (handleConsoleMessage(event)) {
      return;
    }

    if (handleNativeBackUnhandledMessage(event)) {
      return;
    }

    onMessage(event);
  };
}

export { makeOnMessage };
