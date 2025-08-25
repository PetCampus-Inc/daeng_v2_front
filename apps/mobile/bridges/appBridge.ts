import EventEmitter from 'eventemitter3';
import { WebViewMessageEvent } from 'react-native-webview';

export const eventEmitter = new EventEmitter();

// Native → Web
export const postMessage = (webViewRef: any, event: string, payload: any = {}) => {
  const message = JSON.stringify({ event, payload });
  webViewRef?.current?.postMessage(message);
};

// Web → Native
export const handleMessage = (event: WebViewMessageEvent) => {
  try {
    const data = JSON.parse(event.nativeEvent.data);
    if (data?.event) {
      eventEmitter.emit(data.event, data.payload);
    }
  } catch (err) {
    console.warn('Invalid message:', err);
  }
};
