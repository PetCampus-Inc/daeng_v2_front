'use client';

import { useEffect } from 'react';
import { ActionButton, Icon, TextField, TextFieldInput } from '@knockdog/ui';
import Link from 'next/link';
import { useHeaderContext } from '@widgets/Header';

export default function Page() {
  const { setTitle } = useHeaderContext();

  useEffect(() => {
    setTitle('프로필 등록');
  }, [setTitle]);

  return (
    <div className='mt-[86px] px-4'>
      {/* progress 영역 */}
      <div className='flex gap-x-[6px] py-2'>
        <div className='bg-fill-secondary-200 h-[6px] flex-1 rounded-full' />
        <div className='bg-fill-secondary-700 h-[6px] flex-1 rounded-full' />
        <div className='bg-fill-secondary-200 h-[6px] flex-1 rounded-full' />
        <div className='bg-fill-secondary-200 h-[6px] flex-1 rounded-full' />
      </div>
      <div className='flex flex-col gap-y-[40px] py-5'>
        <h1 className='h1-extrabold'>
          살구의 <span className='text-text-accent'>생일</span>을
          <br />
          알려주세요
        </h1>
        <div>
          <TextField label='테어난 해' indicator='(선택)'>
            <TextFieldInput placeholder='년도를 선택해 주세요' />
          </TextField>
        </div>
        <TextField
          label='견종'
          prefix={<Icon icon='Search' />}
          disabled
          indicator='(선택)'
        >
          <TextFieldInput placeholder='견종을 검색해 보세요' />
        </TextField>
      </div>

      <div className='fixed bottom-0 left-0 right-0 flex gap-x-2 bg-white px-4 py-5'>
        <Link href='/signup/pet-details/step3' className='flex-1'>
          <ActionButton variant='secondaryFill' className='w-full'>
            다음
          </ActionButton>
        </Link>
      </div>
    </div>
  );
}
