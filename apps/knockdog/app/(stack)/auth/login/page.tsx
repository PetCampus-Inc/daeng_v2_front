'use client';

import React, { useMemo, useState } from 'react';

import { Divider } from '@knockdog/ui';
import Image from 'next/image';
import { GuestLoginButton, LoginButton } from '@features/auth';
import { SOCIAL_PROVIDER, type SocialProvider } from '@entities/social-user';
import { SafeArea } from '@shared/ui/safe-area';
import { isAndroid } from '@shared/lib/device';
import { useStackNavigation } from '@shared/lib/bridge';

export default function LoginPage() {
  const { getParams } = useStackNavigation();
  const [redirectTo] = useState(() => getParams()?.redirectTo as string | undefined);

  const providers = useMemo(() => {
    const allProviders = Object.values(SOCIAL_PROVIDER) as SocialProvider[];
    if (isAndroid()) {
      return allProviders.filter((provider) => provider !== SOCIAL_PROVIDER.APPLE);
    }
    return allProviders;
  }, []);

  return (
    <SafeArea className='flex h-screen flex-col items-center justify-between'>
      <div className='flex w-fit flex-col items-center'>
        <p className='body1-medium'>우리 강아지에게 딱 맞는 유치원을 찾을 땐,</p>

        <div className='flex w-full flex-col items-center gap-y-3'>
          <div className='relative mt-5 h-auto w-[40%]'>
            <Image
              src='/images/img_logo_text.png'
              alt='login-dog'
              width={0}
              height={0}
              sizes='100vw'
              className='h-auto w-full object-cover'
            />
          </div>
          <div className='relative mt-5 h-auto w-[90%]'>
            <Image
              src='/images/img_login.png'
              alt='login-dog'
              width={0}
              height={0}
              sizes='100vw'
              className='h-auto w-full object-cover'
            />
          </div>
        </div>
      </div>

      <div className='absolute right-0 bottom-[10%] left-0 flex flex-col gap-y-7 px-4'>
        <div className='flex flex-col gap-y-3'>
          {providers.map((provider) => (
            <LoginButton key={provider} provider={provider} redirectTo={redirectTo} />
          ))}
        </div>

        <div className='flex items-center gap-x-2'>
          <Divider className='flex-1' />
          <span className='text-text-tertiary body2-regular'>또는</span>
          <Divider className='flex-1' />
        </div>

        <GuestLoginButton redirectTo={redirectTo} />
      </div>
    </SafeArea>
  );
}
