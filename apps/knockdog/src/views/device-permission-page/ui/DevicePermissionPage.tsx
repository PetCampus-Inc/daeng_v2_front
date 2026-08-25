'use client';

import { useEffect, useRef, useState } from 'react';
import { ActionButton, Divider, Icon } from '@knockdog/ui';

import { devicePermissionContent } from '../config/devicePermissionContent';
import { requestDevicePermissions } from '../model/requestDevicePermissions';
import { usePushSettingMutation } from '@entities/user';
import { markDevicePermissionIntroSeen } from '@shared/lib/auth/devicePermissionIntro';
import { consumePostSignUpRedirect, getInternalRedirect } from '@shared/lib/auth/postSignUpRedirect';
import { route } from '@shared/constants/route';
import { useNavigationResult, useStackNavigation } from '@shared/lib/bridge';

const PERMISSION_PROMPT_DELAY_MS = 1_000;
/** 확인 시 권한 브릿지가 hang 되어도 UX가 막히지 않게 하는 상한 */
const CONFIRM_PERMISSION_WAIT_MS = 1_500;

function DevicePermissionPage() {
  const content = devicePermissionContent;
  const { reset, back } = useStackNavigation();
  const navResult = useNavigationResult<boolean>();
  const requestPromiseRef = useRef<Promise<void> | null>(null);
  const [hasRequestStarted, setHasRequestStarted] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { mutateAsync: updatePushSetting } = usePushSettingMutation();

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      if (cancelled) return;

      requestPromiseRef.current = requestDevicePermissions().then(async (notificationPermission) => {
        if (notificationPermission.grantedNow) {
          await updatePushSetting({ pushEnabled: true });
        }
      });
      setHasRequestStarted(true);
    }, PERMISSION_PROMPT_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [updatePushSetting]);

  const handleConfirm = async () => {
    if (!hasRequestStarted || isConfirming) return;

    setIsConfirming(true);

    try {
      // OS 권한 요청이 이미 시작됐으면 확인을 막지 않는다.
      // (에뮬/이미 허용된 권한에서 브릿지 request가 resolve되지 않는 케이스 방지)
      await Promise.race([
        requestPromiseRef.current ?? Promise.resolve(),
        new Promise<void>((resolve) => {
          window.setTimeout(resolve, CONFIRM_PERMISSION_WAIT_MS);
        }),
      ]);
      markDevicePermissionIntroSeen();

      const searchParams = new URLSearchParams(window.location.search);
      // 신규 가입자는 내 주변에서 필수 약관 동의 바텀시트를 먼저 표시한다.
      // 가입 전 저장한 redirectTo는 약관 동의 완료 시점에 소비한다.
      if (searchParams.get('deferRequiredTerms') === 'true') {
        await reset(route.root);
        return;
      }

      const redirectTo =
        getInternalRedirect(searchParams.get('redirectTo')) ?? consumePostSignUpRedirect();

      if (redirectTo) {
        await reset(redirectTo);
        return;
      }

      if (searchParams.get('resume') === 'stack') {
        navResult.send(true);
        await back();
        return;
      }

      await reset(route.root);
    } catch {
      setIsConfirming(false);
    }
  };

  return (
    <div className='bg-bg-0 flex h-full flex-col'>
      <div className='min-h-0 flex-1 px-4 py-5'>
        <h1 className='h1-extrabold text-text-primary whitespace-pre-line'>{content.title}</h1>
        <div className='bg-bg-50 mt-8 flex w-full flex-col rounded-xl p-5'>
          {content.items.map((item, index) => (
            <div key={item.title}>
              {index > 0 ? <Divider className='my-5' /> : null}
              <div className='flex flex-col gap-1'>
                <div className='body1-bold text-text-primary flex items-center gap-1'>
                  <Icon icon={item.icon} className='text-text-primary size-5' />
                  {item.title}
                </div>
                <p className='body2-regular text-text-secondary'>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='shrink-0 px-4 py-5'>
        <ActionButton
          type='button'
          variant='primaryFill'
          size='large'
          className='w-full'
          disabled={!hasRequestStarted || isConfirming}
          onClick={() => void handleConfirm()}
        >
          {content.confirmLabel}
        </ActionButton>
      </div>
    </div>
  );
}

export { DevicePermissionPage };
