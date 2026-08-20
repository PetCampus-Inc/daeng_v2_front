import { ConfigContext, ExpoConfig } from 'expo/config';
import 'dotenv/config';

const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;
const iosUrlScheme = process.env.EXPO_PUBLIC_IOS_URL_SCHEME;
const WEBVIEW_URL = process.env.EXPO_PUBLIC_WEBVIEW_URL;
const androidGoogleServicesFile = process.env.GOOGLE_SERVICES_JSON_PATH ?? './google-services.json';

if (!WEBVIEW_URL) {
  throw new Error('EXPO_PUBLIC_WEBVIEW_URL is not defined');
}

// Universal Links / App Links용 호스트
const WEBVIEW_HOST = new URL(WEBVIEW_URL).hostname;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: '똑독',
  slug: 'petcampus',
  owner: 'petcampus',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'daengv2mobile',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  extra: {
    eas: {
      projectId: '226d42fd-7ef3-4c94-b193-414946151e41',
    },
  },
  ios: {
    supportsTablet: false,
    usesAppleSignIn: true,
    bundleIdentifier: 'net.knockdog.petcampus.v2',
    googleServicesFile: './GoogleService-Info.plist',
    associatedDomains: [`applinks:${WEBVIEW_HOST}`],
    infoPlist: {
      LSApplicationQueriesSchemes: ['nmap', 'tel'],
      ITSAppUsesNonExemptEncryption: false,
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: false,
        NSAllowsArbitraryLoadsInWebContent: false,
        NSExceptionDomains: {
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
      NSPhotoLibraryUsageDescription: '프로필이나 메모에 사진을 올릴 때 사진첩을 사용해요.',
      NSPhotoLibraryAddUsageDescription: '간직하고 싶은 사진을 앨범에 바로 저장할 때 사용해요.',
      NSCameraUsageDescription:'똑독에서 내 사진을 공유할 수 있도록 카메라 접근 권한을 허용해주세요.'
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ff6e0c',
    },
    edgeToEdgeEnabled: true,
    package: 'net.knockdog.petcampus.v2',
    googleServicesFile: androidGoogleServicesFile,
    permissions: [
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.POST_NOTIFICATIONS',
    ],
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'https', host: WEBVIEW_HOST }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  plugins: [
    'expo-font',
    'expo-router',
    'expo-apple-authentication',
    'expo-notifications',
    '@react-native-firebase/app',
    '@react-native-firebase/messaging',
    './plugins/rnfirebase-disable-spm',
    './plugins/naver-map-queries',
    [
      'expo-image-picker',
      {
        photosPermission: '프로필이나 메모에 사진을 올릴 때 사진첩을 사용해요.',
        cameraPermission: '똑독에서 내 사진을 공유할 수 있도록 카메라 접근 권한을 허용해주세요.',
        microphonePermission: false,
      },
    ],
    [
      'expo-media-library',
      {
        photosPermission: '프로필이나 메모에 사진을 올릴 때 사진첩을 사용해요.',
        savePhotosPermission: '간직하고 싶은 사진을 앨범에 바로 저장할 때 사용해요.',
        isAccessMediaLocationEnabled: false,
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        backgroundColor: '#ffffff',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission: '내 주변에 있는 반려견 유치원을 빠르게 찾기 위해 현재 위치를 확인해요.',
        locationAlwaysAndWhenInUsePermission: false,
        locationAlwaysPermission: false,
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
