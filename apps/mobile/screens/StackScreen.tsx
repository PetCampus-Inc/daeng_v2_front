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
import { NATIVE_BACK_INJECT } from '@/bridges/lib/nativeBackInject';

type StackRoute = RouteProp<RootStackParamList, 'Stack'>;

export default function StackScreen() {
  const { path, initialState } = useRoute<StackRoute>().params;
  const webviewRef = useRef<WebView>(null);
  const navigation = useNavigation();

  // navReset/navReplace가 같은 화면을 유지한 채 route params(path)만 갱신하는 경우
  // (예: 알림장 전송 후 mode=edit를 떼는 것)에도 uri prop이 바뀌면 웹뷰가 통째로
  // 새로고침되어 실행 중이던 JS(전송 성공 후 토스트 등)까지 날아간다. 마운트 시점
  // 경로로 uri를 고정하고, 이후 path 변경은 아래 effect에서 history.replaceState
  // 주입으로만 반영한다.
  const [initialPath] = useState(path);
  const [currentUrl, setCurrentUrl] = useState(initialPath);
  const currentUrlRef = useRef(initialPath);

  const isExternal = useMemo(() => isExternalWebViewUrl(currentUrl), [currentUrl]);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    if (!navState.url) return;
    currentUrlRef.current = navState.url;
    setCurrentUrl(navState.url);
  }, []);

  const lastSyncedPathRef = useRef(initialPath);
  useEffect(() => {
    if (path === lastSyncedPathRef.current) return;
    lastSyncedPathRef.current = path;

    webviewRef.current?.injectJavaScript(`
      (function() {
        try {
          var url = new URL(${JSON.stringify(path)}, window.location.href);
          history.replaceState(null, '', url.pathname + url.search + url.hash);
          window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
        } catch (e) {}
      })(); true;
    `);
  }, [path]);

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
      const url = currentUrlRef.current || initialPath;

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
  }, [navigation, initialPath]);

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
        uri={initialPath}
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
