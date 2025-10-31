import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // ★ SafeAreaProvider 사용
import { PortalProvider } from '@gorhom/portal'; // ★ 포털
import RootStackNavigator from './components/navigation/RootStackNavigator';
import { navigationRef } from './bridges/lib/navigationRef';
import { ToastProvider } from './components/toast'; // ★ 토스트 프로바이더 (네이티브 구현)

// 앱 시작 시 스플래시 자동 숨김 방지
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

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
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [appIsReady]);

  // 준비 전엔 네이티브 스플래시 유지(리액트 트리 렌더 안 함)
  if (!appIsReady) {
    return null;
  }

  return (
    // 제스처가 최상단을 감싸야 스와이프-투-디스미스 제스처가 안정적으로 동작
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 세이프에어리어를 먼저 공급 (토스트 뷰포트가 bottom inset을 사용) */}
      <SafeAreaProvider>
        {/* 포털 루트: 토스트가 네비게이션 위 레이어로 뜨도록 */}
        <PortalProvider>
          {/* 상태바는 취향에 따라 */}
          <StatusBar style='light' />
          {/* onLayout에서 스플래시 숨김 */}
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            {/* 토스트 프로바이더가 네비게이션 바/스크린 “밖”에 있어야 어디서든 toast() 가능 */}
            <ToastProvider>
              <NavigationContainer ref={navigationRef}>
                <RootStackNavigator />
              </NavigationContainer>
            </ToastProvider>
          </View>
        </PortalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
