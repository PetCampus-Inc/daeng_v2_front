import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import type { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS, type PermissionStatus } from '@knockdog/bridge-core';

function mapExpoStatus(status: string, canAskAgain: boolean): { status: PermissionStatus; canAskAgain: boolean } {
  if (status === 'granted' || status === 'limited') return { status: 'allowed', canAskAgain: true };
  if (status === 'undetermined') return { status: 'undetermined', canAskAgain: true };
  return { status: 'denied', canAskAgain };
}

export function registerPermissionHandlers(router: NativeBridgeRouter) {
  router.register(METHODS.requestCameraPermission, async () => {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    return mapExpoStatus(result.status, result.canAskAgain);
  });

  router.register(METHODS.requestPhotosPermission, async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return mapExpoStatus(result.status, result.canAskAgain);
  });

  router.register(METHODS.requestNotificationPermission, async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('push_notifications', {
        name: '일반 알림',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted || existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
      return { status: 'allowed' as const, canAskAgain: true };
    }

    const requested = await Notifications.requestPermissionsAsync();
    return mapExpoStatus(requested.status, requested.canAskAgain);
  });
}
