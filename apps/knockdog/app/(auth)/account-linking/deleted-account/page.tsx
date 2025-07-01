'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ActionButton as Button, Icon } from '@knockdog/ui';
import { useHeaderContext } from '@widgets/Header';

export default function AccountLinkingPage() {
  const { method } = useParams();
  const { setTitle } = useHeaderContext();

  const isKakao = method === 'kakao';
  const isGoogle = method === 'google';
  const isApple = method === 'apple';

  useEffect(() => {
    setTitle('계정 연동');
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
          SNS 연동 해제 계정이 있어요!
        </p>
        <p className='h1-extrabold'> 계정을 연동할까요? </p>

        <div className='bg-fill-secondary-50 body1-medium flex flex-col rounded-lg p-4 text-center'>
          petcampus@daum.net
        </div>
        <div className='fixed bottom-[58px] left-0 right-0 flex gap-x-2 px-4 py-5'>
          <Button variant='secondaryLine' className='w-full'>
            돌아가기
          </Button>
          <Button variant='secondaryFill' className='w-full'>
            연동하기
          </Button>
        </div>
      </div>
    </div>
  );
}
