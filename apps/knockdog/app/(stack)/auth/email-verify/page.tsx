'use client';

import React, { useEffect, useState } from 'react';
import { Icon, ActionButton, TextField, TextFieldInput } from '@knockdog/ui';
import { useHeaderContext } from '@widgets/Header';
import { useVerificationTimer } from '@features/login';

export default function AccountLinkingPage() {
  // 인증여부
  const [isVerified] = useState(false);
  const { formattedTime, start, status } = useVerificationTimer({
    duration: 180,
  });

  const { setTitle } = useHeaderContext();

  useEffect(() => {
    setTitle('계정 연동');
  }, [setTitle]);

  return (
    <div className='mt-[98px] px-4'>
      <div className='flex flex-col gap-[32px] py-5'>
        <p className='h1-extrabold'>이메일에서 인증해주세요</p>
        <div className='flex gap-x-2'>
          <TextField suffix={formattedTime}>
            <TextFieldInput placeholder='이메일을 입력해주세요' />
          </TextField>

          <ActionButton
            className='w-[80px]'
            variant='secondaryFill'
            disabled={status === 'RUNNING'}
            onClick={() => {
              start();
            }}
          >
            {'재전송'}
          </ActionButton>
        </div>

        <div className='fixed bottom-[58px] left-0 right-0 px-4'>
          <div className='mb-[28px] flex items-center justify-center gap-x-1'>
            <p className='label-semibold text-text-tertiary'>이메일이 오지 않아요</p>
            <Icon icon='ChevronRight' className='text-text-tertiary h-4 w-4' />
          </div>

          <ActionButton variant='secondaryFill' disabled={!isVerified} className='my-5 w-full'>
            완료하기
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
