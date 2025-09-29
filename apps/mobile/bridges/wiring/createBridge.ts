import type { RefObject } from 'react';
import type WebView from 'react-native-webview';
import { wireWebView } from '@knockdog/bridge-native';
import { makeRouter } from '../handlers/router';

/**
 * WebView에 브릿지를 연결하는 함수
 * @param webRef WebView 참조
 * @returns {onMessage, sendEvent, notifyReady}
 */
function createBridgeForWebView(webRef: RefObject<WebView>) {
  const router = makeRouter();
  return wireWebView(webRef, router);
}

export { createBridgeForWebView };
