'use client';

import { useEffect, useState } from 'react';
import { ActionButton, Icon, TextField, TextFieldInput } from '@knockdog/ui';
import Link from 'next/link';
import { useHeaderContext } from '@widgets/Header';

export default function PetInfoPage() {
  const { setTitle } = useHeaderContext();
  const [petName, setPetName] = useState('');

  useEffect(() => {
    setTitle('프로필 등록');
  }, [setTitle]);

  return (
    <div className='mt-[86px] px-4'>
      <div className='flex flex-col gap-y-4 py-5'>
        <h1 className='h1-extrabold'>
          <span className='text-text-accent'>강아지 사진과 이름</span>을 알려주세요
        </h1>
        <div className='flex flex-col items-center gap-y-4'>
          <div className='bg-primitive-neutral-50 relative h-[120px] w-[120px] rounded-full'>
            <div className='absolute bottom-0 right-0 flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white'>
              <Icon icon='Camera' className='h-5 w-5' />
            </div>
          </div>
        </div>
        <div>
          <TextField label='강아지 이름' required>
            <TextFieldInput placeholder='8자 이내 한글' value={petName} onChange={(e) => setPetName(e.target.value)} />
          </TextField>
        </div>
      </div>

      <div className='fixed bottom-0 left-0 right-0 flex gap-x-2 bg-white px-4 py-5'>
        <Link href='/signup/profile/pet-info/relation' className='flex-1'>
          <ActionButton variant='secondaryFill' className='w-full' disabled={petName.length === 0}>
            다음
          </ActionButton>
        </Link>
      </div>
    </div>
  );
}
