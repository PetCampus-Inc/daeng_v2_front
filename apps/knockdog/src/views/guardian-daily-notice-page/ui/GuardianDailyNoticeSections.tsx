'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { Icon } from '@knockdog/ui';

import { guardianDailyNoticeContent } from '@views/guardian-daily-notice-page/config/guardianDailyNoticeContent';

interface GuardianDailyNoticeSectionProps {
  iconSrc: string;
  title: string;
  children: ReactNode;
}

function GuardianDailyNoticeSection({ iconSrc, title, children }: GuardianDailyNoticeSectionProps) {
  return (
    <div className='flex w-full items-start gap-2'>
      <div className='size-6 shrink-0 overflow-hidden rounded'>
        <Image src={iconSrc} alt='' width={24} height={24} className='size-6 object-cover' />
      </div>
      <div className='flex min-w-0 flex-1 flex-col gap-2'>
        <p className='h3-semibold text-text-primary'>{title}</p>
        {children}
      </div>
    </div>
  );
}

interface GuardianDailyNoticeStoolBadgeProps {
  label: string;
}

function GuardianDailyNoticeStoolBadge({ label }: GuardianDailyNoticeStoolBadgeProps) {
  return (
    <div className='bg-fill-primary-50 radius-r2 flex h-9 w-full items-center justify-center px-4'>
      <div className='flex items-center justify-center gap-1'>
        <Icon icon='Plus' className='text-text-accent size-5' aria-hidden='true' />
        <span className='label-semibold text-text-accent'>{label}</span>
      </div>
    </div>
  );
}

function GuardianDailyNoticeAlbumRow({ onClick }: { onClick: () => void }) {
  const content = guardianDailyNoticeContent;

  return (
    <button
      type='button'
      className='flex w-full items-center justify-between'
      onClick={onClick}
      aria-label={content.albumViewAriaLabel}
    >
      <span className='body2-semibold text-text-primary'>{content.albumViewLabel}</span>
      <Icon icon='ChevronRight' className='text-text-primary size-5' aria-hidden='true' />
    </button>
  );
}

const SPRING_RING_COUNT = 11;

function GuardianDailyNoticeSpring() {
  const content = guardianDailyNoticeContent;

  return (
    <div className='pointer-events-none absolute inset-x-0 bottom-0 z-10 flex translate-y-[calc(50%+4px)] items-center justify-center gap-[26px] px-4'>
      {Array.from({ length: SPRING_RING_COUNT }, (_, index) => (
        <Image
          key={index}
          src={content.springRingSrc}
          alt=''
          width={9}
          height={19}
          unoptimized
          className='h-[19px] w-[9px] shrink-0'
        />
      ))}
    </div>
  );
}

export {
  GuardianDailyNoticeAlbumRow,
  GuardianDailyNoticeSection,
  GuardianDailyNoticeSpring,
  GuardianDailyNoticeStoolBadge,
};
