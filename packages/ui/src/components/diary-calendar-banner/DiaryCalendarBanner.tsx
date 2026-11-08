import { ChevronRight, Paw } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

const DIARY_CALENDAR_BANNER_STATE = {
  today: 'today',
  past: 'past',
  disabled: 'disabled',
} as const;

type DiaryCalendarBannerState = keyof typeof DIARY_CALENDAR_BANNER_STATE;

interface DiaryCalendarBannerProps {
  state?: DiaryCalendarBannerState;
  dogName?: string;
  className?: string;
  onClick?: () => void;
}

/** V4 / Dog Diary / Calendar Banner */
function DiaryCalendarBanner({ state = 'today', dogName = '강아지 이름', className, onClick }: DiaryCalendarBannerProps) {
  const isDisabled = state === 'disabled';
  const label = isDisabled
    ? '일기 3번을 모두 썼어요. 내일 다시 만나요!'
    : state === 'past'
      ? `이 날 ${dogName}의 일기를 써볼까요?`
      : `오늘 ${dogName}의 일기를 써볼까요?`;

  const content = (
    <>
      <span className={cn('gap-x1 flex min-w-0 items-center', isDisabled && 'justify-center')}>
        <Paw className={cn('size-x5 shrink-0', isDisabled ? 'text-text-caption' : 'text-text-accent')} />
        <span className={cn('body2-bold', isDisabled ? 'text-text-caption' : 'text-text-primary')}>{label}</span>
      </span>
      {isDisabled ? null : <ChevronRight className='text-text-primary shrink-0' />}
    </>
  );

  const itemClassName = cn(
    'radius-r3 flex h-x14 w-full items-center py-x4 pl-x4 pr-x2',
    isDisabled ? 'bg-bg-100 justify-center gap-x2_5' : 'bg-fill-primary-50 justify-between',
    className
  );

  if (isDisabled) {
    return <div className={itemClassName}>{content}</div>;
  }

  return (
    <button type='button' onClick={onClick} className={itemClassName}>
      {content}
    </button>
  );
}

export { DiaryCalendarBanner, DIARY_CALENDAR_BANNER_STATE };
export type { DiaryCalendarBannerProps, DiaryCalendarBannerState };
