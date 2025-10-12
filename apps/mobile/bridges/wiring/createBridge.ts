import type { RefObject } from 'react';
import type WebView from 'react-native-webview';
import { wireWebView, serializeForJS } from '@knockdog/bridge-native';
import { makeRouter } from '../handlers/router';
import { navBridgeHub } from '../model/navBridgeHub';
import { BRIDGE_VERSION, type BridgeEventMap } from '@knockdog/bridge-core';

// A의 WebView로 이벤트 재주입
function forwardEventTo(webRef: RefObject<WebView>, event: string, payload: unknown) {
  const msg = {
    id: `evt-${Date.now()}`,
    type: 'event' as const,
    event,
    payload,
    meta: { v: BRIDGE_VERSION, source: 'native', ts: Date.now() },
  };
  const safe = serializeForJS(msg);

  try {
    webRef.current?.injectJavaScript(`window.__bridge?.receive(${safe}); true;`);
  } catch (err) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error('[forwardEventTo] inject failed:', err, { event });
    }
  }
}

/**
 * WebView에 브릿지를 연결하는 함수
 * @param webRef WebView 참조
 * @returns wireWebView의 반환값 (onMessage, sendEvent, notifyReady)
 */
function createBridgeForWebView(webRef: RefObject<WebView>) {
  const router = makeRouter(webRef);

  return wireWebView(webRef, router, {
    onWebEvent: (event, payload, source) => {
      // nav.result, nav.cancel 이벤트만 라우팅
      if (event !== 'nav.result' && event !== 'nav.cancel') {
        return;
      }

      // 타입 안전한 txId 추출
      const navPayload = payload as BridgeEventMap['nav.result'] | BridgeEventMap['nav.cancel'];
      const txId = navPayload?.txId;

      if (!txId) {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn('[createBridgeForWebView] onWebEvent without txId:', event, payload);
        }
        return;
      }

      const targetRef = navBridgeHub.get(txId);
      if (!targetRef?.current) {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn('[createBridgeForWebView] no target WebView for txId:', txId);
        }
        return;
      }

      forwardEventTo(targetRef, event, payload);
      navBridgeHub.resolve(txId);
    },
  });
}

export { createBridgeForWebView };
