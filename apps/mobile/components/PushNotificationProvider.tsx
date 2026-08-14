import { useEffect } from 'react';
import { Platform } from 'react-native';
import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  requestPermission,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { pushCoordinator } from '@/lib/pushCoordinator';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

const firebaseMessaging = getMessaging();
const pushPlatform = 'IOS' as const;

function notificationData(message: RemoteMessage): Record<string, unknown> {
  return message.data ?? {};
}

async function showForegroundNotification(message: RemoteMessage) {
  const title = message.notification?.title;
  const body = message.notification?.body;
  if (!title && !body) return;

  await Notifications.scheduleNotificationAsync({
    content: { title: title ?? '', body: body ?? '', data: notificationData(message) },
    trigger: null,
  });
}

/** FCM 수신·탭 처리를 앱 생명주기와 무관하게 한 곳에 모은다. */
export function PushNotificationProvider() {
  useEffect(() => {
    // 이번 릴리스의 기기 등록 계약은 iOS FCM만 지원한다.
    if (Platform.OS !== 'ios') return;

    let mounted = true;

    const initialize = async () => {
      try {
        const permission = await requestPermission(firebaseMessaging);
        const authorized =
          permission === AuthorizationStatus.AUTHORIZED || permission === AuthorizationStatus.PROVISIONAL;
        if (!authorized) return;

        await registerDeviceForRemoteMessages(firebaseMessaging);
        const token = await getToken(firebaseMessaging);
        if (mounted) pushCoordinator.setToken(token, pushPlatform);

        const initialMessage = await getInitialNotification(firebaseMessaging);
        if (initialMessage) pushCoordinator.enqueueNavigation(notificationData(initialMessage));
      } catch (error) {
        // 권한 거절·Firebase 설정 오류는 앱을 중단시키지 않는다.
        console.warn('[Push] initialization failed', error);
      }
    };

    void initialize();
    const tokenUnsubscribe = onTokenRefresh(firebaseMessaging, (token) => pushCoordinator.setToken(token, pushPlatform));
    const foregroundUnsubscribe = onMessage(firebaseMessaging, (message) => {
      void showForegroundNotification(message).catch((error) => console.warn('[Push] foreground display failed', error));
    });
    const openedUnsubscribe = onNotificationOpenedApp(firebaseMessaging, (message) => {
      pushCoordinator.enqueueNavigation(notificationData(message));
    });
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      pushCoordinator.enqueueNavigation(response.notification.request.content.data);
    });

    return () => {
      mounted = false;
      tokenUnsubscribe();
      foregroundUnsubscribe();
      openedUnsubscribe();
      responseSubscription.remove();
    };
  }, []);

  return null;
}
