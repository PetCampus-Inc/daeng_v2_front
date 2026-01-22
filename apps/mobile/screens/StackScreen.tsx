import BridgeDebugOverlay from '@/components/BridgeDebugOverlay';
import WebViewScreen from '@/components/WebViewScreen';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useRef, useEffect, useMemo } from 'react';
import WebView from 'react-native-webview';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@/types/navigation';
import { navBridgeHub } from '@/bridges/model/navBridgeHub';

type StackRoute = RouteProp<RootStackParamList, 'Stack'>;

function isExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // EXPO_PUBLIC_WEBVIEW_URL 또는 NEXT_PUBLIC_WEB_URL과 origin 비교
    const webUrl = process.env.EXPO_PUBLIC_WEBVIEW_URL || process.env.NEXT_PUBLIC_WEB_URL || '';
    if (!webUrl) return url.startsWith('http://') || url.startsWith('https://');

    const webUrlOrigin = new URL(webUrl || 'http://localhost').origin;
    return urlObj.origin !== webUrlOrigin;
  } catch {
    // URL 파싱 실패 시 경로로 간주 (외부 URL 아님)
    return false;
  }
}

export default function StackScreen() {
  const { path, initialState } = useRoute<StackRoute>().params;
  const webviewRef = useRef<WebView>(null);
  const navigation = useNavigation();

  const isExternal = useMemo(() => isExternalUrl(path), [path]);

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

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {isExternal && (
        <SafeAreaView edges={['top']} style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <Ionicons name='chevron-back' size={24} color='#000' />
            </TouchableOpacity>
            <View style={styles.rightSpacer} />
          </View>
        </SafeAreaView>
      )}
      <WebViewScreen uri={path} webviewRef={webviewRef} initialState={initialState} />
      {/* <BridgeDebugOverlay /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  rightSpacer: {
    width: 40,
  },
});
