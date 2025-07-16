'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ActionButton, Icon, BottomSheet } from '@knockdog/ui';

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
      <BottomSheet.Root open={isOpen} onOpenChange={setIsOpen}>
        <BottomSheet.Content>
          <BottomSheet.Handle />
          <BottomSheet.Header className='border-line-200 justify-between border-b'>
            <BottomSheet.Title>마케팅 정보 수신 동의</BottomSheet.Title>
            <BottomSheet.Close className='absolute right-4 flex items-center justify-center'>
              <Icon icon='Close' />
            </BottomSheet.Close>
          </BottomSheet.Header>
          <div className='px-6 py-4'>
            <p className='body2-regular text-text-secondary whitespace-pre-line'>
              {
                '"똑독(주)"(이하 "회사")는 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, 「개인정보 보호법」 등 관계 법령에 따라 광고성 정보를 전송하기 위해 수신자의 사전 수신 동의를 받고 있으며, 광고성 정보 수신자의 수신 동의 여부를 정기적으로 확인합니다. 다만 동의하지 않을 경우, 서비스 및 상품 소개, 혜택 안내, 이벤트 정보 제공 등 목적에 따른 혜택에 제한이 있을 수 있습니다.\n\n01. 목적\n앱 푸시, 문자메시지(알림톡), 이메일을 통한 광고성 정보 전송\n똑독 및 제휴 서비스의 소식, 혜택, 이벤트, 광고 등 마케팅 활용\n똑독 서비스 이용에 따른 정보성 알림은 수신 동의 여부와 무관하게 제공됩니다.\n\n02. 이용 항목\n휴대폰번호, 이메일주소\n\n03. 보유 및 이용 기간\n마케팅 활용 동의일로부터 똑독 서비스 탈퇴 또는 동의 철회 시까지\n\n※ 본 동의는 선택 동의로서, 거부하시더라도 서비스 이용에는 제한이 없습니다.\n※ 마케팅 정보 수신 동의/해제는 언제든지 앱의 설정 메뉴에서 변경하실 수 있습니다. (똑독 앱 내: 마이페이지 > 알림 설정 > 마케팅 수신 동의)'
              }
            </p>
          </div>
        </BottomSheet.Content>
      </BottomSheet.Root>
    </>
  );
}
