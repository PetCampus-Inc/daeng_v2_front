import { useCallback, useEffect, useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import RootStackNavigator from './components/navigation/RootStackNavigator';
import { navigationRef } from './bridges/lib/navigationRef';

// 네이티브 스플래시 자동 숨김 방지
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // 필요한 리소스, API, 폰트 등 로딩
        await new Promise((r) => setTimeout(r, 1000)); // 예시

        setAppIsReady(true);
      } finally {
        // 네이티브 스플래시 숨김
        await SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, []);

  // 실제 앱이 준비된 이후에도 잠깐 커스텀 스플래시를 보여줄 수 있음
  useEffect(() => {
    if (appIsReady) {
      const timer = setTimeout(() => setShowCustomSplash(false), 1500); // 1.5초 노출
      return () => clearTimeout(timer);
    }
  }, [appIsReady]);

  // ✅ 아직 네이티브 스플래시 유지 중일 땐 React 트리 렌더 X
  if (!appIsReady) {
    return null;
  }

  // ✅ 커스텀 스플래시 (React Native 내부)
  if (showCustomSplash) {
    return (
      <View style={styles.customSplash}>
        <Image source={require('./assets/images/splash.png')} style={styles.splashImage} resizeMode='cover' />

        <ActivityIndicator color='#fff' size='large' style={{ marginTop: 20 }} />
      </View>
    );
  }

  // ✅ 실제 앱 시작
  return (
    <SafeAreaView style={{ flex: 1 }} onLayout={async () => SplashScreen.hideAsync()}>
      <StatusBar translucent backgroundColor='transparent' />
      <NavigationContainer ref={navigationRef}>
        <RootStackNavigator />
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  customSplash: {
    flex: 1,
    backgroundColor: '#FF6600', // 원하는 배경색
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
});
