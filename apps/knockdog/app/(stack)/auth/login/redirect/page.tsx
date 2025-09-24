'use client';

import React from 'react';
import { redirect, useRouter } from 'next/navigation';
import { Header } from '@widgets/Header';

import { LoginButton } from '@features/auth';
import { SOCIAL_PROVIDER_KO, SocialUser } from '@entities/social-user';
import { route } from '@shared/constants/route';
import { TypedStorage } from '@shared/lib';
import { STORAGE_KEYS } from '@shared/constants';

export default function RedirectLoginPage() {
  const { push } = useRouter();

  const linkedSocialUserStorage = new TypedStorage<SocialUser | null>(STORAGE_KEYS.LINKED_SOCIAL_USER, {
    initialValue: null,
  });

  const linkedSocialUser = linkedSocialUserStorage.get();

  if (!linkedSocialUser) redirect(route.auth.login.root);

  const handleMigrate = () => push(route.auth.socialMigrate.root);

  return (
    <>
      <Header>
        <Header.BackButton />
        <Header.Title>기존 회원 로그인</Header.Title>
      </Header>

      <div className='mt-10 flex h-full flex-col px-4'>
        <div className='flex flex-1 flex-col py-5'>
          <p className='h1-extrabold'>
            동일한 이메일로 가입된
            <br />
            <span className='text-text-accent'>{SOCIAL_PROVIDER_KO[linkedSocialUser.provider]} 계정</span>이 있어요!
          </p>

          <div className='bg-fill-secondary-50 body1-medium mt-8 flex flex-col rounded-lg p-4 text-center'>
            {linkedSocialUser.email}
          </div>
        </div>

        <div className='mb-5 flex flex-col gap-3 px-4'>
          <LoginButton provider={linkedSocialUser.provider} />
          <button className='label-semibold text-text-secondary py-3 underline' onClick={handleMigrate}>
            기존 계정으로 로그인 할 수 없나요?
          </button>
        </div>
      </div>
    </>
  );
}
