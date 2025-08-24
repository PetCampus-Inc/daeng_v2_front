'use client';

import React from 'react';

import { Icon, Divider } from '@knockdog/ui';
import { LoginButton } from '@features/login';
import { SOCIAL_PROVIDER } from '@entities/social';

export default function LoginPage() {
  return (
    <div className='mb-[20%] mt-[16%] flex h-screen flex-col justify-between gap-y-4'>
      <div className='flex flex-col items-center'>
        <p className='body1-medium'>우리 강아지에게 딱 맞는 유치원을 찾을 땐,</p>
      </div>

      {/* 하단 영역 */}
      <div className='left-0 right-0 flex flex-col gap-y-7 bg-white px-4'>
        <div className='flex flex-col gap-y-3'>
          {Object.values(SOCIAL_PROVIDER).map((provider) => (
            <LoginButton key={provider} provider={provider} />
          ))}
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
