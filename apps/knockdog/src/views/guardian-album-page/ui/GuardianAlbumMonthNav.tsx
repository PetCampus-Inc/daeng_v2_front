'use client';

import { Icon } from '@knockdog/ui';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import { formatKoreanYearMonth } from '@views/guardian-kindergarten-page/lib/formatGuardianKindergartenDate';

interface GuardianAlbumMonthNavProps {
  month: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

function GuardianAlbumMonthNav({ month, onPrevMonth, onNextMonth }: GuardianAlbumMonthNavProps) {
  const { monthNav } = guardianAlbumContent;

  return (
    <div className='bg-bg-0 relative flex w-full items-center justify-center p-4'>
      <div className='gap-x2 flex flex-1 items-center justify-center'>
        <button
          type='button'
          className='inline-flex size-6 items-center justify-center'
          aria-label={monthNav.prevAriaLabel}
          onClick={onPrevMonth}
        >
          <Icon icon='ChevronLeft' className='text-fill-secondary-500 size-6' />
        </button>
        <p className='h3-extrabold text-text-primary'>{formatKoreanYearMonth(month)}</p>
        <button
          type='button'
          className='inline-flex size-6 items-center justify-center'
          aria-label={monthNav.nextAriaLabel}
          onClick={onNextMonth}
        >
          <Icon icon='ChevronRight' className='text-fill-secondary-500 size-6' />
        </button>
      </div>

      <button
        type='button'
        className='absolute top-1/2 right-4 inline-flex size-6 -translate-y-1/2 items-center justify-center'
        aria-label={monthNav.searchAriaLabel}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 디자인 제공 PNG 아이콘 */}
        <img
          src={monthNav.searchIconSrc}
          alt=''
          width={20}
          height={20}
          className='size-5'
          draggable={false}
        />
      </button>
    </div>
  );
}

export { GuardianAlbumMonthNav };
