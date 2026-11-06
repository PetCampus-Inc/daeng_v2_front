'use client';

import { ActionButton } from '@knockdog/ui';
import Image from 'next/image';
import { Header } from '@widgets/Header';
import { useOpenExternalLink, useStackNavigation } from '@shared/lib/bridge';
import { EXTERNAL_LINKS } from '@shared/constants';

export default function RejoinBlockedPage() {
  const openExternalLink = useOpenExternalLink();
  const { back } = useStackNavigation();

  const handleContactClick = () => {
    openExternalLink(EXTERNAL_LINKS.CONTACT);
  };

  const handleBackClick = () => {
    back();
  };

  return (
    <>
      <Header>
        <Header.BackButton />
        <Header.Title>탈퇴한 계정</Header.Title>
      </Header>

      {/* 컨텐츠 영역 */}
      <div className='flex-1 px-5'>
        <h1 className='h1-extrabold text-text-primary mt-10'>탈퇴한 이메일이에요</h1>
        <p className='body1-regular text-text-primary mt-2'>
          탈퇴 후 7일간 재가입이 불가능해요.
          <br />
          관련 문의사항은 똑독에 문의해주세요.
        </p>

        {/* 이미지 영역 */}
        <div className='mt-10 flex justify-center'>
          <Image src='/images/img_signup_blocked.png' alt='재가입 불가' width={230} height={230} />
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <div className='flex gap-2 px-4 py-5'>
        <ActionButton variant='secondaryLine' size='large' className='flex-1' onClick={handleContactClick}>
          똑독에 문의하기
        </ActionButton>
        <ActionButton variant='secondaryFill' size='large' className='flex-1' onClick={handleBackClick}>
          돌아가기
        </ActionButton>
      </div>
    </>
  );
}
