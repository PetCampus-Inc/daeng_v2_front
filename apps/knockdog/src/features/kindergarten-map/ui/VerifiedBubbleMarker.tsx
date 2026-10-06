import { Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

interface VerifiedBubbleMarkerProps {
  title: string;
  distance: string;
  bookmarked?: boolean;
  hasMemo?: boolean;
  selected?: boolean;
  connectionBadgeLabel?: string;
}

/** 똑독 인증 업체용 지도 마커 */
export function VerifiedBubbleMarker({
  title,
  distance,
  bookmarked,
  hasMemo,
  selected,
  connectionBadgeLabel,
}: VerifiedBubbleMarkerProps) {
  return (
    <div className='relative w-[113px] select-none'>
      {connectionBadgeLabel && (
        <div className='bg-fill-primary-500 radius-full absolute bottom-[calc(100%+4px)] left-0 flex h-[26px] min-w-[99px] w-fit items-center justify-center gap-x0_5 px-x2 py-x1'>
          <span className='bg-fill-secondary-0 flex size-x4 shrink-0 items-center justify-center rounded-full'>
            <Icon icon='Paw' className='text-fill-primary-500 size-[13.33px]' />
          </span>
          <span className='caption1-semibold text-text-primary-inverse whitespace-nowrap'>{connectionBadgeLabel}</span>
        </div>
      )}
      <div
        className={cn(
          'radius-r2 bg-fill-secondary-0 border-fill-primary-500 box-border flex h-[54px] w-[113px] flex-col items-center border px-[7px] py-[7px]',
          selected && 'bg-fill-secondary-700 border-fill-secondary-700'
        )}
      >
        <div className='flex h-[38px] w-[97px] items-start justify-center gap-x0_5'>
          <Icon icon='Verified' className='size-x5 shrink-0' />
          <div className='flex h-[38px] w-[75px] flex-col items-start'>
            <span className={cn('body2-bold text-text-primary h-x5 w-[61px] text-left', selected && 'text-text-primary-inverse')}>
              {title}
            </span>
            <div className='flex h-[18px] w-[75px] items-center justify-center gap-x0_5'>
              <span className={cn('caption1-semibold text-text-tertiary', selected && 'text-text-secondary-inverse')}>
                {distance}
              </span>
              {bookmarked && (
                <Icon icon='BookmarkFill' className={cn('text-fill-secondary-700 size-x4', selected && 'text-text-primary-inverse')} />
              )}
              {hasMemo && <Icon icon='Note' className={cn('text-fill-secondary-700 size-x4', selected && 'text-text-primary-inverse')} />}
            </div>
          </div>
        </div>
      </div>
      <svg
        className='absolute top-[calc(100%-8px)] left-1/2 -translate-x-1/2'
        width='16'
        height='17'
        viewBox='0 0 16 17'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          className={cn('stroke-fill-primary-500 fill-fill-secondary-0', selected && 'stroke-fill-secondary-700 fill-fill-secondary-700')}
          d='M9.12012 13.751C8.66522 14.5797 7.52051 14.6315 6.97949 13.9062L6.87988 13.751L2.95508 6.60058C2.48775 5.7491 3.10396 4.70818 4.0752 4.70801L11.9248 4.70801C12.896 4.70818 13.5123 5.7491 13.0449 6.60059L9.12012 13.751Z'
        />
        <rect className={cn('fill-fill-secondary-0', selected && 'fill-fill-secondary-700')} x='2' y='4.00073' width='12' height='3' />
      </svg>
    </div>
  );
}
