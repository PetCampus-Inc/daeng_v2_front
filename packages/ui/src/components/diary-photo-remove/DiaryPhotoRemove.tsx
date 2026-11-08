import { type SVGProps } from 'react';

import { cn } from '@knockdog/ui/lib';

interface DiaryPhotoRemoveProps {
  className?: string;
  onClick?: () => void;
}

function RemoveIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path d='M3 3L6 6M6 6L9 9M6 6L9 3M6 6L3 9' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' />
    </svg>
  );
}

/** V4 / Dog Diary / Button Remove */
function DiaryPhotoRemove({ className, onClick }: DiaryPhotoRemoveProps) {
  return (
    <button
      type='button'
      aria-label='삭제'
      onClick={onClick}
      className={cn(
        'bg-fill-secondary-200 inline-flex size-[22px] items-center justify-center rounded-full shadow-[0_1px_4px_rgba(12,12,13,0.1),0_1px_4px_rgba(12,12,13,0.05)]',
        className
      )}
    >
      <RemoveIcon className='text-text-caption' />
    </button>
  );
}

export { DiaryPhotoRemove };
export type { DiaryPhotoRemoveProps };
