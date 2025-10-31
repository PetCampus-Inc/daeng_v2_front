import React from 'react';
import type { RefObject } from 'react';
import WebView from 'react-native-webview';
import { BridgeWebView } from '@/bridges/ui/BridgeWebView';
import type { InitialState } from '@/types/navigation';

type AnyWebViewRef = RefObject<WebView | null> | RefObject<WebView | null>;

interface WebViewScreenProps {
  uri: string;
  webviewRef?: AnyWebViewRef;
  initialState?: InitialState;
}

export default function WebViewScreen({ uri, webviewRef, initialState }: WebViewScreenProps) {
  return <BridgeWebView uri={uri} webviewRef={webviewRef as RefObject<WebView>} initialState={initialState} />;
}
