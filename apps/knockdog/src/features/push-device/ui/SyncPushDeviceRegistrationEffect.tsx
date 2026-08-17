'use client';

import { useEffect, useRef } from 'react';

import { registerPushDevice, useUserStore } from '@entities/user';
import { isNativeWebView } from '@shared/lib/device';
import { tokenUtils } from '@shared/utils';

/**
 * 이미 로그인된 세션으로 앱을 열었을 때도 푸시 기기를 한 번 등록한다.
 */
function SyncPushDeviceRegistrationEffect() {
  const userId = useUserStore((state) => state.user?.userId);
  const didRegisterRef = useRef(false);

  useEffect(() => {
    if (!isNativeWebView() || !userId || !tokenUtils.hasAccessToken()) return;
    if (didRegisterRef.current) return;

    didRegisterRef.current = true;
    void registerPushDevice();
  }, [userId]);

  return null;
}

export { SyncPushDeviceRegistrationEffect };
