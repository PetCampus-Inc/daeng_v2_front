'use client';

import { useEffect, useState } from 'react';
import { useBridge } from '@shared/lib/bridge';
import { useUserStore } from '@entities/user';
import { tokenUtils } from '@shared/utils';
import { isNativeWebView } from '@shared/lib/device';
import { putPushDevice } from '@entities/user/api/pushDevice';
import { savePushDeviceRegistration } from '../model/pushDeviceStorage';
import {
  isPushDeviceLogoutInProgress,
  trackPendingPushDeviceRegistration,
} from '../model/pendingPushDeviceRegistration';
import {
  PUSH_DEVICE_PUT_TIMEOUT_MS,
  RENEW_INTERVAL_MS,
  markPushDeviceRegistrationComplete,
  releasePushDeviceRegistrationLock,
  renewPushDeviceRegistrationLock,
  tryAcquirePushDeviceRegistrationLock,
} from '../model/pushDeviceRegistrationLock';

type FcmTokenPayload = { token: string; platform: 'IOS' | 'ANDROID' };
const isDev = process.env.NODE_ENV !== 'production';

function isHydrated() {
  return useUserStore.persist?.hasHydrated?.() ?? true;
}

function maskPushToken(token: string) {
  if (token.length <= 12) return '***';
  return `${token.slice(0, 8)}...${token.slice(-4)}`;
}

function logPushDevice(step: string, detail?: Record<string, unknown>) {
  if (!isDev) return;
  if (detail) {
    console.info('[PushDevice]', step, detail);
    return;
  }
  console.info('[PushDevice]', step);
}

/**
 * 인증된 WebView에서만 기기 API를 호출한다.
 * native token 이벤트는 인증 복원 전에도 올 수 있으므로 마지막 토큰을 보관했다가 처리한다.
 */
function PushDeviceSyncEffect() {
  const bridge = useBridge();
  const user = useUserStore((state) => state.user);
  const [fcmToken, setFcmToken] = useState<FcmTokenPayload | null>(null);
  const isAuthenticated = Boolean(user?.userId && tokenUtils.hasAccessToken());
  const isNative = isNativeWebView();

  useEffect(() => {
    if (!isNative) return;
    const unsubscribe = bridge.on('push.fcmToken', (payload) => {
      if (!payload || typeof payload.token !== 'string' || !payload.token) return;
      logPushDevice('fcm token received from native', {
        platform: payload.platform,
        token: maskPushToken(payload.token),
      });
      setFcmToken(payload);
    });
    return unsubscribe;
  }, [bridge, isNative]);

  useEffect(() => {
    if (!isNative || !isHydrated() || !isAuthenticated) return;
    logPushDevice('session ready — requesting native token delivery', { userId: user?.userId });
    bridge.emit('push.sessionReady');
  }, [bridge, isAuthenticated, isNative, user?.userId]);

  useEffect(() => {
    if (!isNative || !isHydrated() || !isAuthenticated || !user?.userId) return;
    if (!fcmToken) {
      logPushDevice('waiting for fcm token before push-devices registration', { userId: user.userId });
      return;
    }
    if (isPushDeviceLogoutInProgress()) {
      logPushDevice('skip push-devices registration — logout in progress');
      return;
    }

    const registeredUserId = user.userId;
    const token = fcmToken.token;

    // 탭마다 WebView가 PushDeviceSyncEffect를 띄워 동시 PUT → BE 데드락 방지
    const leaseId = tryAcquirePushDeviceRegistrationLock(registeredUserId, token);
    if (!leaseId) {
      logPushDevice('skip push-devices — another webview holds registration lock', {
        userId: registeredUserId,
        token: maskPushToken(token),
      });
      return;
    }

    logPushDevice('registering push device', {
      userId: registeredUserId,
      platform: fcmToken.platform,
      token: maskPushToken(token),
    });

    const renewTimer = window.setInterval(() => {
      renewPushDeviceRegistrationLock(registeredUserId, token, leaseId);
    }, RENEW_INTERVAL_MS);

    const registration = Promise.race([
      putPushDevice({ provider: 'FCM', platform: fcmToken.platform, token }),
      new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error('push-devices put timeout')), PUSH_DEVICE_PUT_TIMEOUT_MS);
      }),
    ])
      .then((pushDeviceId) => {
        // 요청 중 로그아웃하거나 다른 계정으로 전환됐다면 이전 세션의 ID를 저장하지 않는다.
        const currentUserId = useUserStore.getState().user?.userId;
        if (pushDeviceId && currentUserId === registeredUserId && tokenUtils.hasAccessToken()) {
          savePushDeviceRegistration({ userId: registeredUserId, pushDeviceId });
          markPushDeviceRegistrationComplete(registeredUserId, token, leaseId);
          logPushDevice('push device registered', {
            userId: registeredUserId,
            pushDeviceId,
            token: maskPushToken(token),
          });
        } else if (!pushDeviceId) {
          releasePushDeviceRegistrationLock(registeredUserId, token, leaseId);
          console.warn('[PushDevice] push device upsert response has no id; logout cleanup will be skipped');
        } else {
          releasePushDeviceRegistrationLock(registeredUserId, token, leaseId);
          logPushDevice('push device registration result ignored — session changed during request', {
            registeredUserId,
            currentUserId,
          });
        }
      })
      .catch((error) => {
        releasePushDeviceRegistrationLock(registeredUserId, token, leaseId);
        console.warn('[PushDevice] device registration failed', error);
      })
      .finally(() => {
        window.clearInterval(renewTimer);
      });

    void trackPendingPushDeviceRegistration(registration);
  }, [fcmToken, isAuthenticated, isNative, user?.userId]);

  return null;
}

export { PushDeviceSyncEffect };
