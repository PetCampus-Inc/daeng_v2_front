'use client';

import { Icon } from '@knockdog/ui';

interface OwnerDailyDateNavProps {
  label: string;
  onPrevDay: () => void;
  onNextDay: () => void;
  onOpenDatePicker: () => void;
  onGoToday: () => void;
  isPrevDayDisabled?: boolean;
  isNextDayDisabled?: boolean;
  isToday: boolean;
}

const OwnerDailyDateNav = ({
  label,
  onPrevDay,
  onNextDay,
  onOpenDatePicker,
  onGoToday,
  isPrevDayDisabled,
  isNextDayDisabled,
  isToday,
}: OwnerDailyDateNavProps) => {
  return (
    <div className='flex w-full items-center justify-between'>
      <div className='gap-x3 flex items-center'>
        <button
          type='button'
          aria-label='전날'
          disabled={isPrevDayDisabled}
          onClick={onPrevDay}
          className='w-x1 relative flex items-center justify-center before:absolute before:-inset-3 before:content-[""] disabled:opacity-30'
        >
          <Icon icon='ChevronLeft' className='text-text-caption size-x3_5 shrink-0' />
        </button>
        <button type='button' className='gap-x2 flex items-center' onClick={onOpenDatePicker}>
          <span className='h3-extrabold text-text-primary whitespace-nowrap'>{label}</span>
          <Icon icon='Calendar' className='text-text-primary size-x6' />
        </button>
        <button
          type='button'
          aria-label='다음날'
          disabled={isNextDayDisabled}
          onClick={onNextDay}
          className='w-x1 relative flex items-center justify-center before:absolute before:-inset-3 before:content-[""] disabled:opacity-30'
        >
          <Icon icon='ChevronRight' className='text-text-caption size-x3_5 shrink-0' />
        </button>
      </div>
      <button
        type='button'
        disabled={isToday}
        onClick={onGoToday}
        className='border-line-400 caption1-regular text-text-secondary radius-full h-x7 w-[49px] border font-medium'
      >
        오늘
      </button>
    </div>
  );
};

export { OwnerDailyDateNav };
