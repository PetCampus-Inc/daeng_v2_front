'use client';

import { Icon } from '@knockdog/ui';

import { guardianDailyNoticeListContent } from '@views/guardian-daily-notice-list-page/config/guardianDailyNoticeListContent';
import { formatKoreanYearMonth } from '@views/guardian-kindergarten-page/lib/formatGuardianKindergartenDate';

interface GuardianDailyNoticeListMonthNavProps {
  month: Date;
  canGoPrevMonth: boolean;
  canGoNextMonth: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onYearMonthClick: () => void;
}

function GuardianDailyNoticeListMonthNav({
  month,
  canGoPrevMonth,
  canGoNextMonth,
  onPrevMonth,
  onNextMonth,
  onYearMonthClick,
}: GuardianDailyNoticeListMonthNavProps) {
  const { monthNav } = guardianDailyNoticeListContent;

  return (
    <div className='bg-bg-50 flex w-full items-center justify-center p-4'>
      <div className='gap-x2 flex flex-1 items-center justify-center'>
        <button
          type='button'
          className={`inline-flex size-6 items-center justify-center ${canGoPrevMonth ? '' : 'opacity-30'}`}
          aria-label={monthNav.prevAriaLabel}
          onClick={onPrevMonth}
        >
          <Icon icon='ChevronLeft' className='text-fill-secondary-500 size-6' />
        </button>
        <button
          type='button'
          className='h3-extrabold text-text-primary'
          aria-label={monthNav.yearMonthAriaLabel}
          onClick={onYearMonthClick}
        >
          {formatKoreanYearMonth(month)}
        </button>
        <button
          type='button'
          className={`inline-flex size-6 items-center justify-center ${canGoNextMonth ? '' : 'opacity-30'}`}
          aria-label={monthNav.nextAriaLabel}
          onClick={onNextMonth}
        >
          <Icon icon='ChevronRight' className='text-fill-secondary-500 size-6' />
        </button>
      </div>
    </div>
  );
}

export { GuardianDailyNoticeListMonthNav };
