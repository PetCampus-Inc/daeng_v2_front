import BridgeDebugOverlay from '@/components/BridgeDebugOverlay';
import WebViewScreen from '@/components/WebViewScreen';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useRef } from 'react';
import WebView from 'react-native-webview';
import { RootStackParamList } from '@/types/navigation';

type StackRoute = RouteProp<RootStackParamList, 'Stack'>;

export default function StackScreen() {
  const { path, initialState } = useRoute<StackRoute>().params;
  const webviewRef = useRef<WebView>(null);

  return (
    <>
      <WebViewScreen uri={path} webviewRef={webviewRef} initialState={initialState} />
      <BridgeDebugOverlay />
    </>
  );
}
