'use client';

import React, { useEffect } from 'react';
import { ActionButton as Button } from '@knockdog/ui';
import Link from 'next/link';
import { useHeaderContext } from '@widgets/Header';

export default function DeletedAccountPage() {
  const { setTitle } = useHeaderContext();

  useEffect(() => {
    setTitle('계정 연동');
  }, [setTitle]);

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
          <Link href='/login' className='flex-1'>
            <Button variant='secondaryLine' className='w-full'>
              돌아가기
            </Button>
          </Link>
          <Link href='/account-linking' className='flex-1'>
            <Button variant='secondaryFill' className='w-full'>
              연동하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
