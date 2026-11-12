import { ChevronRight, Paw } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

interface DiaryNoteBannerProps {
  dogName?: string;
  className?: string;
  onClick?: () => void;
}

function formatDiaryDogSubject(dogName: string) {
  const lastChar = dogName.at(-1);
  if (!lastChar) return dogName;

  const code = lastChar.charCodeAt(0);
  const hasBatchim = code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
  return `${dogName}${hasBatchim ? '이' : '가'}`;
}

/** V4 / Dog Diary / Kindergarten Note Banner */
function DiaryNoteBanner({ dogName = '콩이', className, onClick }: DiaryNoteBannerProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn('bg-bg-100 radius-r4 gap-x3 flex w-full items-center py-[18px] pr-[14px] pl-[18px] text-left', className)}
    >
      <Paw className='text-text-accent size-x8 shrink-0' />
      <span className='flex min-w-0 flex-1 flex-col'>
        <span className='body1-bold text-text-primary'>{formatDiaryDogSubject(dogName)} 일기를 써본대요!</span>
        <span className='caption1-regular text-text-secondary'>알림장으로 {dogName}의 일기를 쓸 수 있어요.</span>
      </span>
      <ChevronRight className='text-text-primary size-x5 shrink-0' />
    </button>
  );
}

export { DiaryNoteBanner, formatDiaryDogSubject };
export type { DiaryNoteBannerProps };
