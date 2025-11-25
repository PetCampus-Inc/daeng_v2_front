'use client';

import React, { Suspense } from 'react';

import { Icon, Divider } from '@knockdog/ui';
import { LoginButton } from '@features/auth';
import { SOCIAL_PROVIDER } from '@entities/social-user';

export default function LoginPage() {
  return (
    <div className='mt-[16%] mb-[20%] flex h-screen flex-col justify-between gap-y-4'>
      <div className='flex flex-col items-center'>
        <p className='body1-medium'>우리 강아지에게 딱 맞는 유치원을 찾을 땐,</p>
      </div>

      {/* 하단 영역 */}
      <div className='right-0 left-0 flex flex-col gap-y-7 bg-white px-4'>
        <div className='flex flex-col gap-y-3'>
          <Suspense>
            {Object.values(SOCIAL_PROVIDER).map((provider) => (
              <LoginButton key={provider} provider={provider} />
            ))}
          </Suspense>
        </div>

        <div className='flex items-center gap-x-2'>
          <Divider className='flex-1' />
          <span className='text-text-tertiary body2-regular'>또는</span>
          <Divider className='flex-1' />
        </div>

        <div className='label-semibold flex items-center justify-center gap-x-1'>
          게스트로 둘러보기
          <Icon icon='ChevronRight' className='h-4 w-4' />
        </div>
      </div>
    </div>
  );
}
