import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import RootStackNavigator from './components/navigation/RootStackNavigator';
import { navigationRef } from './bridges/lib/navigationRef';

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
    <NavigationContainer ref={navigationRef}>
      <RootStackNavigator />
    </NavigationContainer>
  );
}
