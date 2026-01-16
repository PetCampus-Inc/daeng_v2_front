import { ConfigContext, ExpoConfig } from 'expo/config';
import 'dotenv/config';

const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;
const iosUrlScheme = process.env.EXPO_PUBLIC_IOS_URL_SCHEME;
const WEBVIEW_URL = process.env.EXPO_PUBLIC_WEBVIEW_URL;

if (!WEBVIEW_URL) {
  throw new Error('EXPO_PUBLIC_WEBVIEW_URL is not defined');
}

// Universal Links / App Links용 호스트
const WEBVIEW_HOST = new URL(WEBVIEW_URL).hostname;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'daeng_v2_mobile',
  slug: 'petcampus',
  owner: 'petcampus',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'daengv2mobile',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'cover',
    backgroundColor: '#FF6600',
  },
  extra: {
    eas: {
      projectId: '226d42fd-7ef3-4c94-b193-414946151e41',
    },
  },
  ios: {
    supportsTablet: true,
    usesAppleSignIn: true,
    bundleIdentifier: 'net.knockdog.petcampus.v2',
    associatedDomains: [`applinks:${WEBVIEW_HOST}`],
    infoPlist: {
      LSApplicationQueriesSchemes: ['nmap', 'tel'],
      ITSAppUsesNonExemptEncryption: false,
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: false,
        NSAllowsArbitraryLoadsInWebContent: true,
        NSExceptionDomains: {
          'openapi.map.naver.com': {
            NSExceptionAllowsInsecureHTTPLoads: true,
            NSIncludesSubdomains: false,
          },
          'oapi.map.naver.com': {
            NSExceptionAllowsInsecureHTTPLoads: true,
            NSIncludesSubdomains: false,
          },
          'map.naver.net': {
            NSExceptionAllowsInsecureHTTPLoads: true,
            NSIncludesSubdomains: true,
          },
          'static.naver.net': {
            NSExceptionAllowsInsecureHTTPLoads: true,
            NSIncludesSubdomains: false,
          },
          'blogpfthumb.phinf.naver.net': {
            NSExceptionAllowsInsecureHTTPLoads: true,
            NSIncludesSubdomains: false,
          },
        },
      },
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: ['daengv2mobile'],
        },
        {
          CFBundleURLSchemes: [iosUrlScheme],
        },
      ],
      NSPhotoLibraryUsageDescription: '사진을 선택하여 업로드하기 위해 사진 라이브러리 접근 권한이 필요합니다.',
      NSPhotoLibraryAddUsageDescription: '사진을 저장하기 위해 사진 라이브러리 접근 권한이 필요합니다.',
      NSCameraUsageDescription: '카메라를 사용하여 사진을 촬영하기 위해 카메라 권한이 필요합니다.',
    },
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'cover',
      backgroundColor: '#FF6600',
    },
  },
  android: {
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'cover',
      backgroundColor: '#FF6600',
    },
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#FF6600',
    },
    edgeToEdgeEnabled: true,
    package: 'net.knockdog.petcampus.v2',
    permissions: ['android.permission.ACCESS_COARSE_LOCATION', 'android.permission.ACCESS_FINE_LOCATION'],
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'https', host: WEBVIEW_HOST }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-font',
    'expo-router',
    'expo-apple-authentication',
    './plugins/naver-map-queries',
    [
      'expo-image-picker',
      {
        photoPermission: '사진을 선택하여 업로드하기 위해 사진 라이브러리 접근 권한이 필요합니다.',
        cameraPermission: '카메라를 사용하여 사진을 촬영하기 위해 카메라 권한이 필요합니다.',
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash.png',
        resizeMode: 'cover',
        backgroundColor: '#FF6600',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission: '주변 유치원을 추천해드리기 위해 위치 권한이 필요합니다.',
      },
    ],
    // Kakao 로그인
    [
      'expo-build-properties',
      {
        android: {
          extraMavenRepos: ['https://devrepo.kakao.com/nexus/content/groups/public/'],
        },
      },
    ],
    [
      '@react-native-kakao/core',
      {
        nativeAppKey: kakaoNativeAppKey,
        android: {
          authCodeHandlerActivity: true,
        },
        ios: {
          handleKakaoOpenUrl: true,
        },
      },
    ],
    // Google 로그인
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
