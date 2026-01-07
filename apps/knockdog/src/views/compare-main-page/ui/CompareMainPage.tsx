'use client';

import Image from 'next/image';
import { ActionButton } from '@knockdog/ui';
import { useOpenExternalLink } from '@shared/lib/bridge';
import { SafeArea } from '@shared/ui/safe-area';

const CONTACT_URL = 'https://fifth-potato-175.notion.site/1-1-2ba6c15f67fb8080b956f7bea92a15d5?source=copy_link';

export function CompareMainPage() {
  const openExternalLink = useOpenExternalLink();

  const handleContactClick = () => {
    openExternalLink(CONTACT_URL);
  };

  return (
    <SafeArea className='bg-fill-secondary-0 flex h-dvh flex-col'>
      <h1 className='h1-extrabold text-text-primary mt-[94px] px-4 py-5'>곧 오픈 예정이에요!</h1>

      <Image src='/images/img_comingsoon.png' alt='coming soon' className='mx-auto mt-10' width={200} height={200} />

      <div className='mt-12 flex flex-col gap-7 px-4'>
        <p className='body1-regular text-text-primary whitespace-pre-line'>
          {`유치원 알림장 연동을 원하시는\n강아지 유치원 원장님이시라면 문의주세요!`}
        </p>

        <ActionButton variant='secondaryLine' onClick={handleContactClick} size='large'>
          1:1 문의하기
        </ActionButton>
      </div>
    </SafeArea>
  );
}
