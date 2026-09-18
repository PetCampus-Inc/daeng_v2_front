'use client';

import { Icon } from '@knockdog/ui';

interface OwnerDailyDateNavProps {
  label: string;
  onPrevDay: () => void;
  onNextDay: () => void;
  onOpenDatePicker: () => void;
  onGoToday: () => void;
  isNextDayDisabled?: boolean;
  isToday: boolean;
}

function OwnerDailyDateNav({
  label,
  onPrevDay,
  onNextDay,
  onOpenDatePicker,
  onGoToday,
  isNextDayDisabled,
  isToday,
}: OwnerDailyDateNavProps) {
  return (
    <div className='flex w-full items-center justify-between gap-2'>
      <div className='flex items-center gap-2'>
        <button type='button' aria-label='전날' onClick={onPrevDay}>
          <Icon icon='ChevronLeft' className='text-text-secondary size-6' />
        </button>
        <button type='button' className='flex items-center gap-2' onClick={onOpenDatePicker}>
          <span className='h3-extrabold text-text-primary whitespace-nowrap'>{label}</span>
          <Icon icon='Calendar' className='text-text-primary size-6' />
        </button>
        <button
          type='button'
          aria-label='다음날'
          disabled={isNextDayDisabled}
          onClick={onNextDay}
          className='disabled:opacity-30'
        >
          <Icon icon='ChevronRight' className='text-text-secondary size-6' />
        </button>
      </div>
      <button
        type='button'
        onClick={onGoToday}
        className={
          isToday
            ? 'border-line-accent caption1-semibold text-text-accent rounded-full border px-2 py-1'
            : 'bg-fill-secondary-500 caption1-semibold text-text-primary-inverse rounded-full px-2 py-1'
        }
      >
        오늘
      </button>
    </div>
  );
}

export { OwnerDailyDateNav };
