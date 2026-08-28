import React, { useCallback, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import WebView from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview';
import { applyPendingTabQuery, resolveTabNameFromUri } from '@/bridges/lib/tabQueryInject';
import { BridgeWebView } from '@/bridges/ui/BridgeWebView';
import type { InitialState } from '@/types/navigation';

type AnyWebViewRef = RefObject<WebView | null> | RefObject<WebView | null>;

interface WebViewScreenProps {
  uri: string;
  webviewRef?: AnyWebViewRef;
  initialState?: InitialState;
  onNavigationStateChange?: (navState: WebViewNavigation) => void;
}

function injectNativeTabFocus(webview: WebView | null, focused: boolean) {
  if (!webview) return;

  const script = focused
    ? `(function(){window.__knockdogNativeTabFocused=true;window.dispatchEvent(new CustomEvent('knockdog:native-tab-focus'));})();true;`
    : `(function(){window.__knockdogNativeTabFocused=false;window.dispatchEvent(new CustomEvent('knockdog:native-tab-blur'));})();true;`;

  webview.injectJavaScript(script);
}

export default function WebViewScreen({
  uri,
  webviewRef,
  initialState,
  onNavigationStateChange,
}: WebViewScreenProps) {
  const isFocusedRef = useRef(false);
  const internalRef = useRef<WebView>(null);
  const resolvedRef = (webviewRef ?? internalRef) as RefObject<WebView>;
  const resolveWebView = useCallback(() => resolvedRef.current ?? null, [resolvedRef]);
  const tabName = useMemo(() => resolveTabNameFromUri(uri), [uri]);

  const applyPendingQuery = useCallback(() => {
    if (!tabName) return;
    applyPendingTabQuery(resolveWebView(), tabName);
  }, [resolveWebView, tabName]);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      applyPendingQuery();
      injectNativeTabFocus(resolveWebView(), true);

      return () => {
        isFocusedRef.current = false;
        injectNativeTabFocus(resolveWebView(), false);
      };
    }, [applyPendingQuery, resolveWebView])
  );

  const handleLoadEnd = useCallback(() => {
    applyPendingQuery();
    injectNativeTabFocus(resolveWebView(), isFocusedRef.current);
  }, [applyPendingQuery, resolveWebView]);

  return (
    <BridgeWebView
      uri={uri}
      webviewRef={resolvedRef}
      initialState={initialState}
      onLoadEnd={handleLoadEnd}
      onNavigationStateChange={onNavigationStateChange}
    />
  );
}
