import React from 'react';
import Link from 'next/link';
import { ActionButton } from '@knockdog/ui';

export default function Page() {
  return (
    <div className='mt-[104px]'>
      <div className='px-4 py-5'>
        <h1 className='h1-extrabold mb-[36px]'>
          똑독에 온 것을 환영해요!
          <br />
        </h1>
      </div>
      <div className='fixed bottom-0 left-0 right-0 flex gap-x-2 bg-white px-4 py-5'>
        <Link href='/signup/complete/subscribe' className='flex-1'>
          <ActionButton className='w-full'>시작하기</ActionButton>
        </Link>
      </div>
    </div>
  );
}
