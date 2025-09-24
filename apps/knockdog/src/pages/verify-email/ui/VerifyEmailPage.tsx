'use client';

import React from 'react';
import { redirect } from 'next/navigation';
import { Icon, ActionButton, TextField, TextFieldInput } from '@knockdog/ui';

import { useVerifyEmailProcess } from '../model/useVerifyEmailProcess';

import { Header } from '@widgets/Header';
import { route } from '@shared/constants/route';

function VerifyEmailPage() {
  const { socialUser, timerDisplay, error, sendEmail, verification } = useVerifyEmailProcess();

  // 소셜 유저 정보가 없으면 로그인 페이지로 이동
  if (!socialUser) redirect(route.auth.login.root);

  return (
    <>
      <Header>
        <Header.BackButton />
        <Header.Title>계정 연동</Header.Title>
      </Header>

      <div className='mt-10 flex h-full flex-col px-4'>
        <div className='w-full flex-1 py-5'>
          <p className='h1-extrabold'>이메일에서 인증해주세요</p>

          <div className='mt-10 flex gap-x-2'>
            <div className='flex-1 overflow-hidden'>
              <TextField invalid={!!error} errorMessage={error} suffix={timerDisplay}>
                <TextFieldInput readOnly value={socialUser.email} />
              </TextField>
            </div>

            <ActionButton className='max-w-20' variant='secondaryFill' onClick={sendEmail}>
              재전송
            </ActionButton>
          </div>
        </div>

        <div className='flex flex-col gap-y-6 px-4 py-5'>
          <div className='flex items-center justify-center gap-x-1 py-2'>
            <p className='label-semibold text-text-tertiary'>이메일이 오지 않아요</p>
            <Icon icon='ChevronRight' className='text-text-tertiary h-4 w-4' />
          </div>

          <ActionButton variant='secondaryFill' size='large' onClick={verification}>
            완료하기
          </ActionButton>
        </div>
      </div>
    </>
  );
}

export { VerifyEmailPage };
