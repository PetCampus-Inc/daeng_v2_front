'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { METHODS, type PermissionStatus } from '@knockdog/bridge-core';
import {
  showActivateAlarmToast,
  showOwnerVerificationToast,
} from '@views/alarm-setting-page/model/alarmSettingToast';
import { AlarmToggleRow } from '@views/alarm-setting-page/ui/AlarmToggleRow';

import { Header } from '@widgets/Header';
import { useIsOwnerVerified } from '@features/role-conversion';
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
  const isOwnerVerified = useIsOwnerVerified();
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
      pushEnabled: updates.pushEnabled ?? pushSetting.pushEnabled,
      guardianPushEnabled: updates.guardianPushEnabled ?? pushSetting.guardianPushEnabled,
      ownerPushEnabled: updates.ownerPushEnabled ?? pushSetting.ownerPushEnabled,
    });
  };

  const requestNotificationPermission = async () => {
    if (!isNative) return true;

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
        return false;
      }

      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[AlarmSetting] failed to request notification permission', error);
      }
      return false;
    }
  };

  const isOsNotificationAllowed = !isNative || notificationPermission === 'allowed';
  const isPushEnabled = Boolean(pushSetting?.pushEnabled && isOsNotificationAllowed);

  const handlePushChange = async (checked: boolean) => {
    if (isPushSettingUpdating) return;
    if (checked && !(await requestNotificationPermission())) return;

    handleUpdateSetting({
      pushEnabled: checked,
      guardianPushEnabled: checked,
      ownerPushEnabled: checked,
    });
  };

  const handleGuardianAlarmChange = async (checked: boolean) => {
    if (isPushSettingUpdating) return;
    if (!isPushEnabled) {
      showActivateAlarmToast();
      return;
    }
    if (checked && !(await requestNotificationPermission())) return;

    handleUpdateSetting({ guardianPushEnabled: checked });
  };

  const handleOwnerAlarmChange = async (checked: boolean) => {
    if (isPushSettingUpdating) return;
    if (!isPushEnabled) {
      showActivateAlarmToast();
      return;
    }
    if (!isOwnerVerified) {
      showOwnerVerificationToast();
      return;
    }
    if (checked && !(await requestNotificationPermission())) return;

    handleUpdateSetting({ ownerPushEnabled: checked });
  };

  return (
    <PrivateAccess>
      <Header>
        <Header.BackButton />
        <Header.Title>알림 설정</Header.Title>
      </Header>

      <div className='flex flex-col items-center px-4 py-5'>
        <AlarmToggleRow
          title='알림 받기'
          description='모든 알림을 한 번에 켜거나 끌 수 있어요.'
          pressed={isPushEnabled}
          disabled={isPushSettingUpdating}
          onPressedChange={handlePushChange}
        />

        <div className='bg-bg-100 flex w-full flex-col items-start rounded-lg px-4'>
          <AlarmToggleRow
            title='보호자 알림 받기'
            description='서비스 업데이트, 유치원 소식 등 알림'
            pressed={isPushEnabled && Boolean(pushSetting?.guardianPushEnabled)}
            disabled={isPushSettingUpdating}
            onPressedChange={handleGuardianAlarmChange}
            muted={!isPushEnabled}
          />
          <AlarmToggleRow
            title='원장 알림 받기'
            description='원생 연결, 소식 확인 등 알림'
            pressed={isOwnerVerified && isPushEnabled && Boolean(pushSetting?.ownerPushEnabled)}
            disabled={isPushSettingUpdating}
            onPressedChange={handleOwnerAlarmChange}
            muted={!isOwnerVerified || !isPushEnabled}
          />
        </div>

        <div className='flex w-full items-center justify-center py-4'>
          <span className='label-medium text-text-secondary'>알림을 꺼도 알림함에서는 확인할 수 있어요.</span>
        </div>
      </div>
    </PrivateAccess>
  );
}

export { AlarmSettingPage };
