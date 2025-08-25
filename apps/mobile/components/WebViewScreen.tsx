// /app/(tabs)/WebViewScreen.tsx

import { useBridgeStore } from '@/stores/bridgeStore';
import type { MutableRefObject } from 'react';
import React, { RefObject, useEffect, useRef } from 'react';
import WebView, { WebViewMessageEvent } from 'react-native-webview';

const CONSOLE_PATCH = `
(function() {
  try {
    // 패치가 로드되었음을 알리는 핸드셰이크
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        __console: true,
        level: 'ready',
        args: ['[console-patch] injected']
      }));
    }

    var levels = ['log','warn','error'];
    levels.forEach(function(level){
      var orig = console[level];
      console[level] = function() {
        try {
          var args = Array.prototype.slice.call(arguments).map(function(a){
            try { return typeof a === 'string' ? a : JSON.stringify(a); } catch(_) { return String(a); }
          });
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              __console: true,
              level: level,
              args: args
            }));
          }
        } catch (e) {}
        return orig && orig.apply(console, arguments);
      };
    });
  } catch (e) {}
})();
true;
`;

interface Props {
  uri: string;
  webviewRef?: AnyWebViewRef;
}

type AnyWebViewRef = RefObject<WebView | null> | MutableRefObject<WebView | null>;

export default function WebViewScreen({ uri, webviewRef }: Props) {
  const internalRef = useRef<WebView>(null);
  const refToUse = webviewRef ?? internalRef;

  const { sendBridgeMessage } = useBridgeStore();

  useEffect(() => {
    (globalThis as any).webviewRef = refToUse.current;
  }, [refToUse]);

  const handleOnMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      // 콘솔 포워딩/핸드셰이크 처리
      // (__console) 분기
      if (data?.__console) {
        const args = data.args ?? [];
        switch (data.level) {
          case 'warn':
            console.warn('[WV]', ...args);
            break;
          case 'error':
            console.error('[WV]', ...args);
            break;
          default:
            console.log('[WV]', ...args); // 'log' 또는 'ready' 등은 기본 로그로
        }
        return;
      }

      // 브릿지 메시지 처리
      const { type, payload } = data ?? {};
      useBridgeStore.setState({ lastReceivedType: type, payload });
      useBridgeStore.getState().addLog({ dir: 'in', type, payload, t: Date.now() });
      if (type === 'ping') useBridgeStore.getState().sendBridgeMessage?.('pong', { from: 'app' });
    } catch {
      /* ignore */
    }
  };

  return (
    <WebView
      ref={refToUse}
      source={{ uri }}
      onMessage={handleOnMessage}
      javaScriptEnabled
      originWhitelist={['*']}
      startInLoadingState
      cacheEnabled={false}
      injectedJavaScriptBeforeContentLoaded={CONSOLE_PATCH}
    />
  );
}
