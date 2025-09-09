'use client';

import React from 'react';
import { redirect } from 'next/navigation';

import { LoginButton } from '@features/auth';
import { SOCIAL_PROVIDER_KO, useSocialUserStore } from '@entities/social-user';

export default function RedirectLoginPage() {
  const socialUser = useSocialUserStore((state) => state.socialUser);

  // 소셜 유저 정보가 없으면 로그인 페이지로 이동
  if (!socialUser) redirect('/auth/login');

  return (
    <>
      <div className='mt-[98px] px-4'>
        <div className='flex flex-col gap-[32px] py-5'>
          <p className='h1-extrabold'>
            동일한 이메일로 가입된
            <br />
            <span className='text-text-accent'>{SOCIAL_PROVIDER_KO[socialUser.provider]} 계정</span>이 있어요!
          </p>
          <div className='h-[34px]' />

          <div className='bg-fill-secondary-50 body1-medium flex flex-col rounded-lg p-4 text-center'>
            {socialUser.email}
          </div>

          <div className='fixed bottom-[58px] left-0 right-0 flex flex-col gap-y-3 bg-white px-4 py-5'>
            <LoginButton provider={socialUser.provider} />
          </div>
        </div>
      </div>
    </>
  );
}
