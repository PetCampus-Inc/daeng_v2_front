'use client';

import { useEffect, useRef } from 'react';
import { ActionButton, Divider, Icon } from '@knockdog/ui';

import { devicePermissionContent } from '../config/devicePermissionContent';
import { requestDevicePermissions } from '../model/requestDevicePermissions';
import { markDevicePermissionIntroSeen } from '@shared/lib/auth/devicePermissionIntro';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

const PERMISSION_PROMPT_DELAY_MS = 1_000;

function DevicePermissionPage() {
  const content = devicePermissionContent;
  const { reset } = useStackNavigation();
  const didRequestRef = useRef(false);

  useEffect(() => {
    if (didRequestRef.current) return;
    didRequestRef.current = true;

    const timer = window.setTimeout(() => {
      requestDevicePermissions();
    }, PERMISSION_PROMPT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  const handleConfirm = () => {
    markDevicePermissionIntroSeen();
    reset(route.root);
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
        <ActionButton type='button' variant='primaryFill' size='large' className='w-full' onClick={handleConfirm}>
          {content.confirmLabel}
        </ActionButton>
      </div>
    </div>
  );
}

export { DevicePermissionPage };
