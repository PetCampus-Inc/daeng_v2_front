import BridgeDebugOverlay from '@/components/BridgeDebugOverlay';
import WebViewScreen from '@/components/WebViewScreen';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useRef } from 'react';
import WebView from 'react-native-webview';
export type RootStackParamList = {
  Tabs: undefined;
  Stack: { path: string };
};

type StackRoute = RouteProp<RootStackParamList, 'Stack'>;

export default function StackScreen() {
  const { path } = useRoute<StackRoute>().params;
  const webviewRef = useRef<WebView>(null);

  return (
    <>
      <WebViewScreen uri={path} webviewRef={webviewRef} />;
      <BridgeDebugOverlay />
    </>
  );
}
