import BridgeDebugOverlay from '@/components/BridgeDebugOverlay';
import WebViewScreen from '@/components/WebViewScreen';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useRef, useEffect } from 'react';
import WebView from 'react-native-webview';
import { RootStackParamList } from '@/types/navigation';
import { navBridgeHub } from '@/bridges/model/navBridgeHub';

type StackRoute = RouteProp<RootStackParamList, 'Stack'>;

export default function StackScreen() {
  const { path, initialState } = useRoute<StackRoute>().params;
  const webviewRef = useRef<WebView>(null);
  const navigation = useNavigation();

  // 뒤로가기 감지: beforeRemove 이벤트 리스너
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      // 현재 페이지에 _txId가 있으면 (pushForResult로 열린 페이지)
      const txId = initialState?._txId;
      if (txId && typeof txId === 'string') {
        // 부모 WebView에 nav.cancel 이벤트 전송
        navBridgeHub.cancelPending(txId, 'Navigation cancelled: User navigated back without providing result');
      }
    });

    return unsubscribe;
  }, [navigation, initialState?._txId]);

  return (
    <>
      <WebViewScreen uri={path} webviewRef={webviewRef} initialState={initialState} />
      {/* <BridgeDebugOverlay /> */}
    </>
  );
}
