import React from 'react';
import type { RefObject } from 'react';
import WebView from 'react-native-webview';
import { BridgeWebView } from '@/bridges/ui/BridgeWebView';

type AnyWebViewRef = RefObject<WebView | null> | RefObject<WebView | null>;

export default function WebViewScreen({ uri, webviewRef }: { uri: string; webviewRef?: AnyWebViewRef }) {
  return <BridgeWebView uri={uri} webviewRef={webviewRef as RefObject<WebView>} />;
}
