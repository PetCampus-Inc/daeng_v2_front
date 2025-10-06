import WebView from 'react-native-webview';
import { type RefObject, useRef, useMemo } from 'react';
import { makeOnMessage } from '../lib/onMessage';
import { createBridgeForWebView } from '../wiring/createBridge';
import { buildConsolePatch } from '../lib/consolePatch';

interface Props {
  uri: string;
  webviewRef?: RefObject<WebView>;
}

export function BridgeWebView({ uri, webviewRef }: Props) {
  const CONSOLE_PATCH = useMemo(
    () => buildConsolePatch({ tag: 'WEBVIEW', levels: ['log', 'warn', 'error'], maxLen: 1_000 }),
    []
  );

  const internalRef = useRef<WebView>(null);
  const refToUse = (webviewRef ?? internalRef) as RefObject<WebView>;

  const { onMessage, notifyReady } = useMemo(() => createBridgeForWebView(refToUse), [refToUse]);

  const handleOnMessage = useMemo(() => makeOnMessage(onMessage), [onMessage]);

  return (
    <WebView
      ref={refToUse}
      source={{ uri }}
      onMessage={handleOnMessage}
      onLoadEnd={notifyReady}
      javaScriptEnabled
      originWhitelist={['*']}
      startInLoadingState
      cacheEnabled={false}
      injectedJavaScriptBeforeContentLoaded={__DEV__ ? CONSOLE_PATCH : undefined}
      geolocationEnabled
    />
  );
}
