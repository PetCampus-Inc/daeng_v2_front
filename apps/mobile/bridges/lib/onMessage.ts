import type { WebViewMessageEvent } from 'react-native-webview';
import { handleConsoleMessage } from './consoleOnMessage';

/**
 * WebView에서 메시지를 받아서 처리하는 함수
 * @param onMessage
 */
function makeOnMessage(onMessage: (event: WebViewMessageEvent) => void) {
  return (event: WebViewMessageEvent) => {
    if (handleConsoleMessage(event)) {
      return;
    }

    onMessage(event);
  };
}

export { makeOnMessage };
