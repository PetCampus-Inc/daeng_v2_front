import React from 'react';
import { Icon, Divider } from '@knockdog/ui';

export default function LoginPage() {
  return (
    <div>
      {/* 하단 영역 */}
      <div className='fixed bottom-[78px] left-0 right-0 flex flex-col gap-y-3 bg-white px-4'>
        <button
          type='button'
          className='body1-bold text-text-primary flex w-full items-center justify-center gap-x-2 rounded-lg bg-[#FEE500] py-4'
        >
          <Icon icon='KakaoLogo' />
          카카오톡으로 시작하기
        </button>
        <button
          type='button'
          className='body1-bold border-line-400 flex w-full items-center justify-center gap-x-2 rounded-lg border py-4'
        >
          <Icon icon='GoogleLogo' />
          구글로 시작하기
        </button>
        <button
          type='button'
          className='body1-bold text-text-primary-inverse flex w-full items-center justify-center gap-x-2 rounded-lg border bg-[#000000] py-4'
        >
          <Icon icon='AppleLogo' />
          Apple로 시작하기
        </button>

        <div className='my-[28px] flex items-center gap-x-2'>
          <Divider className='flex-1' />
          <span className='text-text-tertiary body2-regular'>또는</span>
          <Divider className='flex-1' />
        </div>

        <div className='label-semibold flex items-center justify-center gap-x-1'>
          게스트로 둘러보기
          <Icon icon='ChevronRight' className='h-4 w-4' />
        </div>
      </div>
    </div>
  );
}
