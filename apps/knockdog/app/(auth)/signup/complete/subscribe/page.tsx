'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ActionButton, Icon } from '@knockdog/ui';
import dynamic from 'next/dynamic';

const InfoBottomSheet = dynamic(() => import('./InfoBottomSheet'), {
  ssr: false,
});

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className='mt-[56px]'>
        <div className='px-4 py-5'>
          <h1 className='h1-extrabold mb-[36px]'>
            똑독의 새소식을
            <br />
            꾸준히 받아보실래요?
          </h1>

          <div className='mb-5 flex h-[206px] w-full items-center justify-center bg-neutral-50'>
            이미지 영역
          </div>
          <p className='body1-regular text-text-secondary leading-[24px] tracking-[-0.01em]'>
            똑독이 전하는 우리 동네 강아지 유치원의 <br />
            혜택과 이벤트 등 딱 맞는 정보만 보내드릴게요. <br />
            원하실 때 언제든 수신을 끄실 수 있어요.
          </p>
        </div>

        <div className='fixed right-0 bottom-0 left-0 bg-white'>
          <div className='mb-4 flex items-center justify-center bg-white'>
            <button
              onClick={() => setIsOpen(true)}
              className='caption1-semibold text-text-tertiary flex items-center gap-x-1'
            >
              마켓팅 정보 수신 동의
              <Icon icon='ChevronRight' className='h-4 w-4' />
            </button>
          </div>
          <div className='flex gap-x-2 px-4 py-5'>
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
      </div>
      {/* bottom sheet container */}
      <InfoBottomSheet isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
