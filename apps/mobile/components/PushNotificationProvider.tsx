import { useEffect } from 'react';
import { Platform } from 'react-native';
import {
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { pushCoordinator } from '@/lib/pushCoordinator';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

const firebaseMessaging = getMessaging();
const NOTIFICATION_CHANNEL_ID = 'push_notifications';
const pushPlatform = Platform.OS === 'android' ? 'ANDROID' : 'IOS';

function hasNotificationPermission(permission: Notifications.NotificationPermissionsStatus) {
  // Expo 53의 공개 타입은 PermissionResponse 필드를 노출하지 않지만, 네이티브 응답에는 포함된다.
  const response = permission as typeof permission & { granted?: boolean; status?: string };

  return (
    response.granted ||
    response.status === 'granted' ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

async function ensureNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: '일반 알림',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

function notificationData(message: RemoteMessage): Record<string, unknown> {
  return message.data ?? {};
}

async function showForegroundNotification(message: RemoteMessage) {
  const title = message.notification?.title;
  const body = message.notification?.body;
  if (!title && !body) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: title ?? '',
      body: body ?? '',
      data: notificationData(message),
      ...(Platform.OS === 'android' ? { channelId: NOTIFICATION_CHANNEL_ID } : {}),
    },
    trigger: null,
  });
}

/** FCM 수신·탭 처리를 앱 생명주기와 무관하게 한 곳에 모은다. */
export function PushNotificationProvider() {
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await ensureNotificationChannel();
        const permission = await Notifications.getPermissionsAsync();
        if (!hasNotificationPermission(permission)) return;

        if (Platform.OS === 'ios') await registerDeviceForRemoteMessages(firebaseMessaging);
        const token = await getToken(firebaseMessaging);
        if (mounted) pushCoordinator.setToken(token, pushPlatform);

        const initialMessage = await getInitialNotification(firebaseMessaging);
        if (initialMessage) pushCoordinator.enqueueNavigation(notificationData(initialMessage));
      } catch (error) {
        // 권한 거절·Firebase 설정 오류는 앱을 중단시키지 않는다.
        console.warn('[Push] initialization failed', error);
      }
    };

    // OS 권한 요청은 로그인 후 권한 안내 화면이 담당한다. 여기서는 이미 허용된 경우만 초기화한다.
    void initialize();
    const permissionUnsubscribe = pushCoordinator.onNotificationPermissionGranted(() => void initialize());
    const tokenUnsubscribe = onTokenRefresh(firebaseMessaging, (token) => pushCoordinator.setToken(token, pushPlatform));
    const foregroundUnsubscribe = onMessage(firebaseMessaging, (message) => {
      // iOS는 notification 블록이 있으면 expo-notifications 델리게이트가 원본 푸시를 이미 자동으로 배너 표시하므로,
      // 여기서 또 표시하면 중복 알림이 뜬다. Android는 포그라운드에서 자동 표시가 없어 수동 표시가 필요하다.
      if (Platform.OS === 'ios') return;
      void showForegroundNotification(message).catch((error) => console.warn('[Push] foreground display failed', error));
    });
    const openedUnsubscribe = onNotificationOpenedApp(firebaseMessaging, (message) => {
      pushCoordinator.enqueueNavigation(notificationData(message));
    });
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      // iOS 원격 푸시는 content.data가 userInfo["body"]로 제한되어 대부분 비어 있다.
      // trigger.payload는 그 제약 없이 원본 userInfo 전체를 담고 있어 이쪽을 우선 사용한다.
      const trigger = response.notification.request.trigger;
      const remotePayload =
        trigger && 'type' in trigger && trigger.type === 'push'
          ? (trigger as Notifications.PushNotificationTrigger).payload
          : null;
      pushCoordinator.enqueueNavigation(remotePayload ?? response.notification.request.content.data);
    });

    return () => {
      mounted = false;
      permissionUnsubscribe();
      tokenUnsubscribe();
      foregroundUnsubscribe();
      openedUnsubscribe();
      responseSubscription.remove();
    };
  }, []);

  return null;
}
