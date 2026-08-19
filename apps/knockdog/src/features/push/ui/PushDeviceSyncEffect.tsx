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

type FcmTokenPayload = { token: string; platform: 'IOS' | 'ANDROID' };

function isHydrated() {
  return useUserStore.persist?.hasHydrated?.() ?? true;
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
      if (payload && typeof payload.token === 'string' && payload.token) setFcmToken(payload);
    });
    return unsubscribe;
  }, [bridge, isNative]);

  useEffect(() => {
    if (!isNative || !isHydrated() || !isAuthenticated) return;
    bridge.emit('push.sessionReady');
  }, [bridge, isAuthenticated, isNative, user?.userId]);

  useEffect(() => {
    if (!isNative || !isHydrated() || !isAuthenticated || !user?.userId || !fcmToken) return;
    if (isPushDeviceLogoutInProgress()) return;

    const registeredUserId = user.userId;

    const registration = putPushDevice({ provider: 'FCM', platform: fcmToken.platform, token: fcmToken.token })
      .then((pushDeviceId) => {
        // 요청 중 로그아웃하거나 다른 계정으로 전환됐다면 이전 세션의 ID를 저장하지 않는다.
        const currentUserId = useUserStore.getState().user?.userId;
        if (pushDeviceId && currentUserId === registeredUserId && tokenUtils.hasAccessToken()) {
          savePushDeviceRegistration({ userId: registeredUserId, pushDeviceId });
        } else if (!pushDeviceId) {
          console.warn('[Push] push device upsert response has no id; logout cleanup will be skipped');
        }
      })
      .catch((error) => console.warn('[Push] device registration failed', error));

    void trackPendingPushDeviceRegistration(registration);
  }, [fcmToken, isAuthenticated, isNative, user?.userId]);

  return null;
}

export { PushDeviceSyncEffect };
