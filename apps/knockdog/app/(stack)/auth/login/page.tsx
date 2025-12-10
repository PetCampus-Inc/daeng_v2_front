'use client';

import React from 'react';

import { Icon, Divider } from '@knockdog/ui';
import Image from 'next/image';
import { LoginButton } from '@features/auth';
import { SOCIAL_PROVIDER } from '@entities/social-user';
import { SafeArea } from '@shared/ui/safe-area';
import { useStackNavigation } from '@shared/lib/bridge';

export default function LoginPage() {
  const { back } = useStackNavigation();

  const handleGuestClick = () => back();

  return (
    <SafeArea className='flex h-screen flex-col items-center justify-between'>
      <div className='flex w-fit flex-col items-center'>
        <p className='body1-medium'>우리 강아지에게 딱 맞는 유치원을 찾을 땐,</p>

        <div className='relative mt-5 h-auto w-40'>
          <Image
            src='/images/img_logo.png'
            alt='login-dog'
            width={0}
            height={0}
            sizes='100vw'
            className='h-auto w-full object-cover'
          />
        </div>
      </div>

      <div className='absolute right-0 bottom-[10%] left-0 flex flex-col gap-y-7 px-4'>
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

        <button
          className='label-semibold flex items-center justify-center gap-x-1 text-center'
          onClick={handleGuestClick}
        >
          게스트로 둘러보기
          <Icon icon='ChevronRight' className='h-4 w-4' />
        </button>
      </div>
    </SafeArea>
  );
}
