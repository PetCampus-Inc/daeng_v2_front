import { cn } from '@knockdog/ui/lib';
import { Icon } from '@knockdog/ui';

interface BaseBubbleMarkerProps {
  className?: string;
  bookmarked?: boolean;
  hasMemo?: boolean;
}

export function BaseBubbleMarker({ className, bookmarked, hasMemo }: BaseBubbleMarkerProps) {
  return (
    <div className='relative select-none'>
      <div
        className={cn(
          'border-line-700 bg-fill-secondary-0 radius-r2 p-x2 flex min-w-[50px] flex-col items-center border',
          className
        )}
      >
        <div className='gap-x0_5 flex items-center'>
          {bookmarked && <Icon icon='BookmarkFill' className={cn('text-fill-secondary-700 size-x4')} />}
          {hasMemo && <Icon icon='Note' className={cn('text-fill-secondary-700 size-x4')} />}
        </div>
      </div>
      <svg
        className={cn('absolute top-[calc(100%-8px)] left-1/2 -translate-x-1/2')}
        width='16'
        height='17'
        viewBox='0 0 16 17'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          className={cn('stroke-fill-secondary-700 fill-fill-secondary-0')}
          d='M9.12012 13.751C8.66522 14.5797 7.52051 14.6315 6.97949 13.9062L6.87988 13.751L2.95508 6.60058C2.48775 5.7491 3.10396 4.70818 4.0752 4.70801L11.9248 4.70801C12.896 4.70818 13.5123 5.7491 13.0449 6.60059L9.12012 13.751Z'
        />
        <rect className={cn('fill-fill-secondary-0')} x='2' y='4.00073' width='12' height='3' />
      </svg>
    </div>
  );
}
