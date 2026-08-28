import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, View } from 'react-native';
import { NavigationContainer, type NavigationState, type PartialState } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'; // ★ SafeAreaProvider 사용
import { PortalProvider } from '@gorhom/portal'; // ★ 포털
import { navigationRef } from './bridges/lib/navigationRef';
import { ToastProvider } from './components/toast'; // ★ 토스트 프로바이더 (네이티브 구현)
import { initializeKakaoSDK } from '@react-native-kakao/core';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { RootStackNavigator, useLinking } from './components/navigation';
import { PushNotificationProvider } from './components/PushNotificationProvider';
import { BlockingOverlay } from './features/blocking-overlay';
import { pushCoordinator } from './lib/pushCoordinator';
import { useBottomTabBarVisibilityStore } from './bridges/model/bottomTabBarVisibilityStore';

// 앱 시작 시 스플래시 자동 숨김 방지
SplashScreen.preventAutoHideAsync().catch(() => { });

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const linking = useLinking();
  const previousRootRouteNameRef = useRef<string | null>(null);
  const appStateRef = useRef(AppState.currentState);

  const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY || '';
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
  const webClientId = process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID || '';

  useEffect(() => {
    // Kakao SDK 초기화
    initializeKakaoSDK(kakaoNativeAppKey);

    // Google SDK 초기화
    GoogleSignin.configure({ iosClientId, webClientId });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // 필요한 리소스(폰트, 이미지 프리로드 등) 로드 위치
        // 예) await Font.loadAsync({ ... });

        // UX용 최소 노출 시간(선택)
        await new Promise((r) => setTimeout(r, 350));
      } finally {
        setAppIsReady(true);
      }
    })();
  }, []);

  // 루트 레이아웃이 그려지면 스플래시 숨김
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync().catch(() => { });
    }
  }, [appIsReady]);

  const restoreBottomTabBarIfTabs = useCallback(
    (state?: NavigationState | PartialState<NavigationState>) => {
      const navigationState = state ?? navigationRef.getRootState();
      const currentRootRouteName = navigationState?.routes?.[navigationState.index ?? 0]?.name;

      if (currentRootRouteName !== 'Tabs') return;

      useBottomTabBarVisibilityStore.getState().setVisible(true);
      useBottomTabBarVisibilityStore.getState().setDimmed(false);
    },
    []
  );

  const handleNavigationStateChange = useCallback(
    (state: NavigationState | PartialState<NavigationState> | undefined) => {
      const currentRootRouteName = state?.routes?.[state.index ?? 0]?.name;

      // 앱 내부 Stack에서 탭으로 복귀한 경우, 이전 화면이 남긴 GNB 숨김 상태를 복구한다.
      if (previousRootRouteNameRef.current === 'Stack' && currentRootRouteName === 'Tabs') {
        restoreBottomTabBarIfTabs(state);
      }

      previousRootRouteNameRef.current = currentRootRouteName ?? null;
    },
    [restoreBottomTabBarIfTabs]
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const previousAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      // Safari·카카오톡 등 외부 앱을 다녀온 뒤 앱이 foreground로 돌아오는 경우를 처리한다.
      if (previousAppState === 'background' && nextAppState === 'active') {
        restoreBottomTabBarIfTabs();
      }
    });

    return () => subscription.remove();
  }, [restoreBottomTabBarIfTabs]);

  // 준비 전엔 네이티브 스플래시 유지(리액트 트리 렌더 안 함)
  if (!appIsReady) {
    return null;
  }

  return (
    // 제스처가 최상단을 감싸야 스와이프-투-디스미스 제스처가 안정적으로 동작
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 세이프에어리어를 먼저 공급 (토스트 뷰포트가 bottom inset을 사용) */}
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        {/* 포털 루트: 토스트가 네비게이션 위 레이어로 뜨도록 */}
        <PortalProvider>
          {/* 상태바는 취향에 따라 */}
          <StatusBar style='dark' />
          {/* onLayout에서 스플래시 숨김 */}
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            {/* 토스트 프로바이더가 네비게이션 바/스크린 “밖”에 있어야 어디서든 toast() 가능 */}
            <ToastProvider>
              <NavigationContainer
                ref={navigationRef}
                linking={linking}
                onReady={() => {
                  const state = navigationRef.getRootState();
                  previousRootRouteNameRef.current = state?.routes?.[state.index ?? 0]?.name ?? null;
                  pushCoordinator.markNavigationReady();
                }}
                onStateChange={handleNavigationStateChange}
              >
                <PushNotificationProvider />
                <RootStackNavigator />
              </NavigationContainer>
              <BlockingOverlay />
            </ToastProvider>
          </View>
        </PortalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
