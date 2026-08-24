import { METHODS, type PermissionStatus } from '@knockdog/bridge-core';

import { isNativeWebView } from '@shared/lib/device';
import { getBridgeInstance } from '@shared/lib/bridge';
import { requestLocationPermission } from '@shared/lib/geolocation';

const REQUEST_TIMEOUT_MS = 120_000;

interface NotificationPermissionRequestResult {
  status: PermissionStatus;
  grantedNow: boolean;
}

async function requestNativePermission(
  method:
    | typeof METHODS.requestLocationPermission
    | typeof METHODS.requestCameraPermission
    | typeof METHODS.requestPhotosPermission
    | typeof METHODS.getNotificationPermission
    | typeof METHODS.requestNotificationPermission
) {
  const bridge = getBridgeInstance();
  if (!bridge) return null;

  return bridge.request<{ status: PermissionStatus; canAskAgain: boolean }>(method, {}, { timeoutMs: REQUEST_TIMEOUT_MS });
}

async function requestWebCameraPermission() {
  if (!navigator.mediaDevices?.getUserMedia) return;

  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  stream.getTracks().forEach((track) => track.stop());
}

/** 위치 → 카메라 → 사진 → 알림 순으로 OS 권한 다이얼로그를 띄운다. */
async function requestDevicePermissions(): Promise<NotificationPermissionRequestResult> {
  if (!isNativeWebView()) {
    await requestLocationPermission().catch(() => undefined);
    await requestWebCameraPermission().catch(() => undefined);
    const notificationPermissionBefore = typeof Notification === 'undefined' ? null : Notification.permission;
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await Notification.requestPermission().catch(() => undefined);
    }
    const notificationPermissionAfter = typeof Notification === 'undefined' ? null : Notification.permission;
    return {
      status: notificationPermissionAfter === 'granted' ? 'allowed' : notificationPermissionAfter === 'denied' ? 'denied' : 'undetermined',
      grantedNow: notificationPermissionBefore === 'default' && notificationPermissionAfter === 'granted',
    };
  }

  await requestNativePermission(METHODS.requestLocationPermission).catch(() => undefined);
  await requestNativePermission(METHODS.requestCameraPermission).catch(() => undefined);
  await requestNativePermission(METHODS.requestPhotosPermission).catch(() => undefined);
  const notificationPermissionBefore = await requestNativePermission(METHODS.getNotificationPermission).catch(() => null);
  const notificationPermissionAfter = await requestNativePermission(METHODS.requestNotificationPermission).catch(() => null);

  return {
    status: notificationPermissionAfter?.status ?? 'undetermined',
    // 이미 허용된 기기의 다른 계정에 설정을 자동 적용하지 않는다.
    grantedNow: notificationPermissionBefore?.status === 'undetermined' && notificationPermissionAfter?.status === 'allowed',
  };
}

export { requestDevicePermissions };
