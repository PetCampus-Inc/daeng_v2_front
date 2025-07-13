'use client';

import { useEffect } from 'react';
import { ActionButton, Divider, Icon } from '@knockdog/ui';
import Link from 'next/link';
import { useHeaderContext } from '@widgets/Header';

export default function ProfilePage() {
  const { setTitle } = useHeaderContext();

  useEffect(() => {
    setTitle('프로필 등록');
  }, [setTitle]);

  return (
    <div className='mt-[86px] px-4'>
      <div className='flex flex-col gap-y-[40px] py-5'>
        <h1 className='h1-extrabold'>지금 돌보는 강아지가 있나요? </h1>
      </div>

      <div className='fixed bottom-0 left-0 right-0 flex gap-x-2 bg-white px-4 py-5'>
        <Link href='/signup/profile/nickname' className='flex-1'>
          <ActionButton variant='secondaryLine' className='w-full'>
            아니오
          </ActionButton>
        </Link>
        <Link href='/signup/profile/pet-info' className='flex-1'>
          <ActionButton variant='secondaryFill' className='w-full'>
            예
          </ActionButton>
        </Link>
      </div>
    </div>
  );
}
