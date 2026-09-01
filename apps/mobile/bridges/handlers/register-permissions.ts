import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import type { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS, type PermissionStatus } from '@knockdog/bridge-core';
import { pushCoordinator } from '@/lib/pushCoordinator';

function mapExpoStatus(status: string, canAskAgain: boolean): { status: PermissionStatus; canAskAgain: boolean } {
  if (status === 'granted' || status === 'limited') return { status: 'allowed', canAskAgain: true };
  if (status === 'undetermined') return { status: 'undetermined', canAskAgain: true };
  return { status: 'denied', canAskAgain };
}

function isNotificationPermissionGranted(permission: Notifications.NotificationPermissionsStatus) {
  return permission.granted || permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export function registerPermissionHandlers(router: NativeBridgeRouter) {
  router.register(METHODS.requestCameraPermission, async () => {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    return mapExpoStatus(result.status, result.canAskAgain);
  });

  router.register(METHODS.requestPhotosPermission, async () => {
    if (Platform.OS === 'android') {
      // Android 13+는 Photo Picker로 선택하므로 사진첩 read 권한 사전 요청 불필요
      return { status: 'allowed' as const, canAskAgain: false };
    }

    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return mapExpoStatus(result.status, result.canAskAgain);
  });

  router.register(METHODS.getNotificationPermission, async () => {
    const permission = await Notifications.getPermissionsAsync();
    if (isNotificationPermissionGranted(permission)) {
      return { status: 'allowed' as const, canAskAgain: permission.canAskAgain };
    }
    return mapExpoStatus(permission.status, permission.canAskAgain);
  });

  router.register(METHODS.requestNotificationPermission, async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('push_notifications', {
        name: '일반 알림',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    if (isNotificationPermissionGranted(existing)) {
      pushCoordinator.notifyNotificationPermissionGranted();
      return { status: 'allowed' as const, canAskAgain: existing.canAskAgain, requested: false };
    }

    const requested = await Notifications.requestPermissionsAsync();
    if (isNotificationPermissionGranted(requested)) {
      pushCoordinator.notifyNotificationPermissionGranted();
      return { status: 'allowed' as const, canAskAgain: requested.canAskAgain, requested: true };
    }
    return { ...mapExpoStatus(requested.status, requested.canAskAgain), requested: true };
  });
}
