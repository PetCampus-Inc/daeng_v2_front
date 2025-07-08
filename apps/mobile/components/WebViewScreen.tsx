// app/(tabs)/WebViewScreen.tsx
import { eventEmitter, handleMessage, postMessage } from '@/bridges';
import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  uri: string;
}

export default function WebViewScreen({ uri }: Props) {
  const webViewRef = useRef<WebView>(null);

  const sendMessageToWeb = () => {
    postMessage(webViewRef, 'nativePing', { message: 'Hello from Native!' });
  };

  React.useEffect(() => {
    eventEmitter.on('webPing', (payload) => {
      console.log('✅ Web에서 보낸 메시지:', payload);
    });

    return () => {
      eventEmitter.removeAllListeners();
    };
  }, []);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri }}
        onMessage={handleMessage}
        javaScriptEnabled
        cacheEnabled={false}
        originWhitelist={['*']}
        startInLoadingState
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
