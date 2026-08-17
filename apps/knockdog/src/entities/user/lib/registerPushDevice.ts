'use client';

import { METHODS, type PushDeviceRegistration } from '@knockdog/bridge-core';

import { putPushDevice } from '@entities/user/api/pushDevice';
import { getBridgeInstance } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';

/**
 * 네이티브에서 FCM token을 받아 `PUT /push-devices`로 등록.
 * 웹 브라우저/권한 거부/브릿지 실패는 조용히 스킵.
 */
async function registerPushDevice(): Promise<void> {
  if (!isNativeWebView()) return;

  const bridge = getBridgeInstance();
  if (!bridge) return;

  try {
    const registration = await bridge.request<PushDeviceRegistration | null>(METHODS.getPushToken, undefined, {
      timeoutMs: 30_000,
    });

    if (!registration?.token) return;

    await putPushDevice({
      provider: registration.provider,
      platform: registration.platform,
      token: registration.token,
      supportedProvider: registration.supportedProvider,
    });
  } catch (error) {
    console.warn('[push] device 등록 실패', error);
  }
}

export { registerPushDevice };
