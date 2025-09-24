import { ActionButton } from '@knockdog/ui';
import React from 'react';

export default function RejoinBlockedPage() {
  return (
    <div className='relative mx-5 h-screen'>
      <div className='absolute left-1/2 top-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center'>
        {/* 이미지 영역 */}
        <div className='size-22 rounded-full bg-[#F3F3F7]' />

        <p className='h1-semibold mt-5 text-center'>탈퇴한 이메일이에요</p>
        <p className='body1-regular mt-6 whitespace-nowrap text-center'>
          탈퇴 후 7일간 재가입이 불가능해요.
          <br />
          관련 문의사항은 똑독에 문의해주세요.
        </p>

        <ActionButton className='mt-8 w-full' variant='secondaryFill'>
          똑독에 문의하기
        </ActionButton>
      </div>
    </div>
  );
}
