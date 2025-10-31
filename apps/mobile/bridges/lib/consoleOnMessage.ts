// ../lib/consoleOnMessage.ts
import type { WebViewMessageEvent } from 'react-native-webview';

/**
 * WebView에서 콘솔 메시지를 처리하는 함수
 * @param e
 * @returns
 */
function handleConsoleMessage(e: WebViewMessageEvent): boolean {
  try {
    const data = JSON.parse(e.nativeEvent.data);
    if (!data || !data.__console) return false; // 콘솔 메시지가 아니면 패스

    const args = data.args ?? [];
    const tag = data.tag ? `[${data.tag}]` : '';
    switch (data.level) {
      case 'warn':
        console.warn(tag, ...args);
        break;
      case 'error':
        console.error(tag, ...args);
        break;
      default:
        console.log(tag, ...args);
    }
    return true;
  } catch {
    return false; // JSON 아니면 브릿지로 넘기자
  }
}

export { handleConsoleMessage };
