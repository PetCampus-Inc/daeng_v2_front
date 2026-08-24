import WebViewScreen from '@/components/WebViewScreen';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import WebView from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview';
import { View, TouchableOpacity, StyleSheet, BackHandler, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@/types/navigation';
import { navBridgeHub } from '@/bridges/model/navBridgeHub';
import { isExternalWebViewUrl } from '@/bridges/lib/isFirstPartyWebViewUrl';

type StackRoute = RouteProp<RootStackParamList, 'Stack'>;

const NATIVE_BACK_INJECT = `
  (function () {
    try {
      var ev = new CustomEvent('knockdog:native-back', { cancelable: true });
      var allowed = window.dispatchEvent(ev);
      if (allowed) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'knockdog:native-back-unhandled' })
        );
      }
    } catch (e) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'knockdog:native-back-unhandled' })
      );
    }
  })();
  true;
`;

export default function StackScreen() {
  const { path, initialState } = useRoute<StackRoute>().params;
  const webviewRef = useRef<WebView>(null);
  const navigation = useNavigation();
  const [currentUrl, setCurrentUrl] = useState(path);
  const currentUrlRef = useRef(path);

  const isExternal = useMemo(() => isExternalWebViewUrl(currentUrl), [currentUrl]);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    if (!navState.url) return;
    currentUrlRef.current = navState.url;
    setCurrentUrl(navState.url);
  }, []);

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

  // 안드로이드 시스템 뒤로가기
  // - 외부 origin: 웹 스크립트 주입 없이 네이티브 goBack (실패 시 시스템 back 허용)
  // - first-party: knockdog:native-back (이탈 가드 등)
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      const url = currentUrlRef.current || path;

      if (isExternalWebViewUrl(url)) {
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        }
        return false;
      }

      webviewRef.current?.injectJavaScript(NATIVE_BACK_INJECT);
      return true;
    });

    return () => subscription.remove();
  }, [navigation, path]);

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
      <WebViewScreen
        uri={path}
        webviewRef={webviewRef}
        initialState={initialState}
        onNavigationStateChange={handleNavigationStateChange}
      />
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
