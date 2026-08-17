import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

/** `app.config.ts` expo-notifications defaultChannel 과 동일 */
const NOTIFICATION_CHANNEL_ID = 'push_notifications';
const NOTIFICATION_CHANNEL_NAME = '푸시 알림';

interface PushDeviceRegistration {
  provider: 'FCM';
  platform: 'ANDROID' | 'IOS';
  token: string;
  supportedProvider: true;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: NOTIFICATION_CHANNEL_NAME,
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF6E0C',
  });
}

/**
 * 알림 권한 + FCM/APNs device token 발급 후 BE `PUT /push-devices` body 형태로 반환.
 * 실패/거부면 null.
 */
async function registerForPushNotificationsAsync(): Promise<PushDeviceRegistration | null> {
  await ensureAndroidNotificationChannel();

  // iOS 시뮬레이터는 APNs 불가. Android 애뮬(Play 이미지)은 FCM 가능.
  if (Platform.OS === 'ios' && !Device.isDevice) {
    console.warn('[push] iOS 시뮬레이터에서는 푸시 토큰을 발급할 수 없어요.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[push] 알림 권한이 거부됐어요.');
    return null;
  }

  try {
    // BE provider=FCM 계약 → native device token (Android=FCM)
    const devicePushToken = await Notifications.getDevicePushTokenAsync();
    const token = devicePushToken.data;

    if (!token || typeof token !== 'string') {
      console.warn('[push] device token이 비어 있어요.', devicePushToken);
      return null;
    }

    const registration: PushDeviceRegistration = {
      provider: 'FCM',
      platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      token,
      supportedProvider: true,
    };

    console.log('[push] device registration', {
      provider: registration.provider,
      platform: registration.platform,
      token: __DEV__ ? token : `${token.slice(0, 12)}...`,
    });

    return registration;
  } catch (error) {
    console.warn('[push] 토큰 발급 실패', error);
    return null;
  }
}

/**
 * 포그라운드 수신 / 탭 리스너.
 * @returns cleanup
 */
function setupNotificationListeners() {
  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('[push] received', notification.request.content);
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('[push] clicked', response.notification.request.content);
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

export {
  NOTIFICATION_CHANNEL_ID,
  registerForPushNotificationsAsync,
  setupNotificationListeners,
};
export type { PushDeviceRegistration };
