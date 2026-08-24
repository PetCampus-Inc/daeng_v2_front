import React, { useCallback, useRef } from 'react';
import type { RefObject } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import WebView from 'react-native-webview';
import { BridgeWebView } from '@/bridges/ui/BridgeWebView';
import type { InitialState } from '@/types/navigation';

type AnyWebViewRef = RefObject<WebView | null> | RefObject<WebView | null>;

interface WebViewScreenProps {
  uri: string;
  webviewRef?: AnyWebViewRef;
  initialState?: InitialState;
}

function injectNativeTabFocus(webview: WebView | null, focused: boolean) {
  if (!webview) return;

  const script = focused
    ? `(function(){window.__knockdogNativeTabFocused=true;window.dispatchEvent(new CustomEvent('knockdog:native-tab-focus'));})();true;`
    : `(function(){window.__knockdogNativeTabFocused=false;window.dispatchEvent(new CustomEvent('knockdog:native-tab-blur'));})();true;`;

  webview.injectJavaScript(script);
}

export default function WebViewScreen({ uri, webviewRef, initialState }: WebViewScreenProps) {
  const isFocusedRef = useRef(false);
  const resolveWebView = useCallback(() => webviewRef?.current ?? null, [webviewRef]);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      injectNativeTabFocus(resolveWebView(), true);

      return () => {
        isFocusedRef.current = false;
        injectNativeTabFocus(resolveWebView(), false);
      };
    }, [resolveWebView])
  );

  const handleLoadEnd = useCallback(() => {
    // 로드 직후 focus 플래그 재주입 — 현재 focused일 때만 true
    injectNativeTabFocus(resolveWebView(), isFocusedRef.current);
  }, [resolveWebView]);

  return (
    <BridgeWebView
      uri={uri}
      webviewRef={webviewRef as RefObject<WebView>}
      initialState={initialState}
      onLoadEnd={handleLoadEnd}
    />
  );
}
