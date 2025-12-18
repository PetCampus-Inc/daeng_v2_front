import { ConfigContext, ExpoConfig } from 'expo/config';
import 'dotenv/config';

const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;
const iosUrlScheme = process.env.EXPO_PUBLIC_IOS_URL_SCHEME;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'daeng_v2_mobile',
  slug: 'petcampus',
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
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      LSApplicationQueriesSchemes: ['nmap', 'tel'],
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
          CFBundleURLSchemes: [iosUrlScheme],
        },
      ],
      NSPhotoLibraryUsageDescription: '사진을 선택하여 업로드하기 위해 사진 라이브러리 접근 권한이 필요합니다.',
      NSPhotoLibraryAddUsageDescription: '사진을 저장하기 위해 사진 라이브러리 접근 권한이 필요합니다.',
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
        locationAlwaysAndWhenInUsePermission: '$(PRODUCT_NAME) 앱을 사용하기 위해 위치 권한을 허용해주세요.',
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
