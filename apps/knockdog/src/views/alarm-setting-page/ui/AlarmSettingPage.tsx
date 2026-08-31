'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Switch } from '@knockdog/ui';
import { METHODS, type PermissionStatus } from '@knockdog/bridge-core';
import { Header } from '@widgets/Header';
import { usePushSettingQuery, usePushSettingMutation, type PushSetting } from '@entities/user';
import { useBridge } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';
import { trackNotificationPermission } from '@shared/lib/analytics';
import { PrivateAccess } from '@shared/ui/private-access';

function AlarmSettingPage() {
  const bridge = useBridge();
  const isNative = useMemo(() => isNativeWebView(), []);
  const { data: pushSetting } = usePushSettingQuery();
  const { mutate: updatePushSetting, isPending: isPushSettingUpdating } = usePushSettingMutation();
  const [notificationPermission, setNotificationPermission] = useState<PermissionStatus | null>(null);

  const refreshNotificationPermission = useCallback(async () => {
    if (!isNative) return;

    try {
      const result = await bridge.request(METHODS.getNotificationPermission, {});
      setNotificationPermission(result.status);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[AlarmSetting] failed to get notification permission', error);
      }
    }
  }, [bridge, isNative]);

  useEffect(() => {
    void refreshNotificationPermission();

    const handleAppResume = () => void refreshNotificationPermission();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') handleAppResume();
    };

    window.addEventListener('appresume', handleAppResume);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('appresume', handleAppResume);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshNotificationPermission]);

  const handleUpdateSetting = (updates: Partial<PushSetting>) => {
    if (!pushSetting) return;

    updatePushSetting({
      ...pushSetting,
      ...updates,
    });
  };

  const handlePushChange = async (checked: boolean) => {
    if (isPushSettingUpdating) return;

    if (!checked || !isNative) {
      handleUpdateSetting({ pushEnabled: checked });
      return;
    }

    try {
      const permission = await bridge.request(METHODS.requestNotificationPermission, {});
      setNotificationPermission(permission.status);

      if (permission.requested) {
        trackNotificationPermission({
          status: permission.status === 'allowed' ? 'granted' : 'denied',
        });
      }

      if (permission.status !== 'allowed') {
        if (!permission.canAskAgain) {
          await bridge.request(METHODS.openSettings, {});
        }
        return;
      }

      handleUpdateSetting({ pushEnabled: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[AlarmSetting] failed to request notification permission', error);
      }
    }
  };

  const isOsNotificationAllowed = !isNative || notificationPermission === null || notificationPermission === 'allowed';
  const isPushEnabled = Boolean(pushSetting?.pushEnabled && isOsNotificationAllowed);

  return (
    <PrivateAccess>
      <Header>
        <Header.BackButton />
        <Header.Title>알림 설정</Header.Title>
      </Header>

      <div className='px-4 pt-5 pb-4'>
        <div className='flex items-center justify-between gap-2 py-4'>
          <div>
            <h4 className='body1-bold text-text-primary'>알림 받기</h4>
            <span className='text-text-secondary body2-regular'>서비스 업데이트, 유치원 소식 등 알림</span>
          </div>
          <Switch
            key={`push-enabled-${isPushEnabled}`}
            pressed={isPushEnabled}
            disabled={isPushSettingUpdating}
            onPressedChange={handlePushChange}
          />
        </div>
        <div className='flex items-center justify-between gap-2'>
          <span className='text-text-primary body2-regular'>알림을 꺼도 알림함에서는 확인할 수 있어요.</span>
        </div>
      </div>
    </PrivateAccess>
  );
}

export { AlarmSettingPage };
