'use client';

import Image from 'next/image';

import { guardianDailyNoticeListContent } from '@views/guardian-daily-notice-list-page/config/guardianDailyNoticeListContent';

function GuardianDailyNoticeListMonthEmpty() {
  const { monthEmpty } = guardianDailyNoticeListContent;

  return (
    <div className='flex min-h-full w-full flex-1 flex-col items-center justify-center gap-4 px-4'>
      <div className='relative size-[200px] shrink-0'>
        <Image
          src={monthEmpty.imageSrc}
          alt={monthEmpty.imageAlt}
          fill
          className='object-contain'
          sizes='200px'
          priority
        />
      </div>
      <div className='flex w-full flex-col items-center gap-1 text-center'>
        <p className='h2-extrabold text-text-primary'>{monthEmpty.title}</p>
        <p className='body1-regular text-text-primary'>{monthEmpty.description}</p>
      </div>
    </div>
  );
}

export { GuardianDailyNoticeListMonthEmpty };
