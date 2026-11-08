import { type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

const DIARY_CALENDAR_DAY_STATE = {
  pastEmpty: 'pastEmpty',
  todayEmpty: 'todayEmpty',
  futureEmpty: 'futureEmpty',
  emptySelected: 'emptySelected',
  empty: 'empty',
  filled: 'filled',
  filledSelected: 'filledSelected',
  todayFilled: 'todayFilled',
} as const;

type DiaryCalendarDayState = keyof typeof DIARY_CALENDAR_DAY_STATE;

const DAY_NUMBER_CLASS: Record<Exclude<DiaryCalendarDayState, 'empty'>, string> = {
  pastEmpty: 'body2-semibold text-text-secondary',
  todayEmpty: 'body2-extrabold text-text-accent',
  futureEmpty: 'body2-semibold text-text-caption',
  emptySelected: 'body2-extrabold text-text-secondary',
  filled: 'body2-extrabold text-text-primary-inverse',
  filledSelected: 'body2-extrabold text-text-primary-inverse',
  todayFilled: 'body2-extrabold text-text-accent',
};

interface DiaryCalendarDayProps {
  state?: DiaryCalendarDayState;
  image?: ReactNode;
  className?: string;
  children?: ReactNode;
  'aria-label'?: string;
  onClick?: () => void;
}

/** V4 / Dog Diary / Calendar Day */
function DiaryCalendarDay({ state = 'pastEmpty', image, className, children, 'aria-label': ariaLabel, onClick }: DiaryCalendarDayProps) {
  if (state === 'empty') {
    return <span className={cn('inline-flex size-[44px] items-center justify-center', className)} />;
  }

  const isFilled = state === 'filled' || state === 'filledSelected' || state === 'todayFilled';
  const numberClass = DAY_NUMBER_CLASS[state];
  const frame = isFilled ? (
    <span
      className={cn(
        'relative flex size-x10 items-center justify-center overflow-hidden rounded-[10px]',
        state === 'filledSelected' && 'border-2 border-line-accent'
      )}
    >
      <span className='absolute inset-0'>{image}</span>
      <span className='bg-primitive-neutral-1000/20 absolute inset-0' />
      <span className={cn('relative', numberClass)}>{children}</span>
    </span>
  ) : state === 'emptySelected' ? (
    <span className='border-primitive-orange-400 bg-fill-primary-50 radius-r2 flex size-x10 items-center justify-center border-[1.5px] border-dashed'>
      <span className={numberClass}>{children}</span>
    </span>
  ) : (
    <span className='flex size-x10 items-center justify-center'>
      <span className={numberClass}>{children}</span>
    </span>
  );

  return (
    <button
      type='button'
      aria-label={ariaLabel}
      aria-pressed={state === 'emptySelected' || state === 'filledSelected'}
      onClick={onClick}
      className={cn('inline-flex size-[44px] items-center justify-center', className)}
    >
      {frame}
    </button>
  );
}

export { DiaryCalendarDay, DIARY_CALENDAR_DAY_STATE };
export type { DiaryCalendarDayProps, DiaryCalendarDayState };
