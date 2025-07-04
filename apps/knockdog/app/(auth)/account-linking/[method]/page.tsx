'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Icon } from '@knockdog/ui';
import { useHeaderContext } from '@widgets/Header';

export default function AccountLinkingPage() {
  const { method } = useParams();
  const { setTitle } = useHeaderContext();

  const isKakao = method === 'kakao';
  const isGoogle = method === 'google';
  const isApple = method === 'apple';

  useEffect(() => {
    setTitle('기존 회원 로그인');
  }, [setTitle]);

  const methodMap = {
    kakao: '카카오 계정',
    google: '구글 계정',
    apple: 'Apple 계정',
  };

  return (
    <div className='mt-[98px] px-4'>
      <div className='flex flex-col gap-[32px] py-5'>
        <p className='h1-extrabold'>
          동일한 이메일로 가입된
          <br />
          <span className='text-text-accent'>
            {methodMap[method as keyof typeof methodMap] || ''}
          </span>
          이 있어요!
        </p>
        <div className='h-[34px]' />

        <div className='bg-fill-secondary-50 body1-medium flex flex-col rounded-lg p-4 text-center'>
          petcampus@daum.net
        </div>
        <div className='fixed bottom-[58px] left-0 right-0 flex flex-col gap-y-3 bg-white px-4 py-5'>
          {isKakao && (
            <button
              type='button'
              className='body1-bold text-text-primary flex w-full items-center justify-center gap-x-2 rounded-lg bg-[#FEE500] py-4'
            >
              <Icon icon='KakaoLogo' />
              카카오톡으로 시작하기
            </button>
          )}
          {isGoogle && (
            <button
              type='button'
              className='body1-bold border-line-400 flex w-full items-center justify-center gap-x-2 rounded-lg border py-4'
            >
              <Icon icon='GoogleLogo' />
              구글로 시작하기
            </button>
          )}

          {isApple && (
            <button
              type='button'
              className='body1-bold text-text-primary-inverse flex w-full items-center justify-center gap-x-2 rounded-lg border bg-[#000000] py-4'
            >
              <Icon icon='AppleLogo' />
              Apple로 시작하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
