import { METHODS } from '@knockdog/bridge-core';

import { isNativeWebView } from '@shared/lib/device';
import { getBridgeInstance } from '@shared/lib/bridge';
import { requestLocationPermission } from '@shared/lib/geolocation';

const REQUEST_TIMEOUT_MS = 120_000;

async function requestNativePermission(
  method:
    | typeof METHODS.requestLocationPermission
    | typeof METHODS.requestCameraPermission
    | typeof METHODS.requestPhotosPermission
    | typeof METHODS.requestNotificationPermission
) {
  const bridge = getBridgeInstance();
  if (!bridge) return;

  await bridge.request(method, {}, { timeoutMs: REQUEST_TIMEOUT_MS });
}

async function requestWebCameraPermission() {
  if (!navigator.mediaDevices?.getUserMedia) return;

  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  stream.getTracks().forEach((track) => track.stop());
}

/** 위치 → 카메라 → 사진 → 알림 순으로 OS 권한 다이얼로그를 띄운다. */
async function requestDevicePermissions() {
  if (!isNativeWebView()) {
    await requestLocationPermission().catch(() => undefined);
    await requestWebCameraPermission().catch(() => undefined);
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await Notification.requestPermission().catch(() => undefined);
    }
    return;
  }

  await requestNativePermission(METHODS.requestLocationPermission).catch(() => undefined);
  await requestNativePermission(METHODS.requestCameraPermission).catch(() => undefined);
  await requestNativePermission(METHODS.requestPhotosPermission).catch(() => undefined);
  await requestNativePermission(METHODS.requestNotificationPermission).catch(() => undefined);
}

export { requestDevicePermissions };
