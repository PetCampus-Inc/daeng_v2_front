import React from 'react';

import { cn } from '@knockdog/ui/lib';
import { Icon } from '@knockdog/ui';
import { ellipsisText } from '@shared/utils';

interface PlaceMarkerProps {
  title: string;
  titleMaxLength?: number;
  distance?: number;
  selected?: boolean;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
}

export function PlaceMarker({
  title,
  titleMaxLength = 7,
  distance,
  selected,
  className,
  containerClassName,
  onClick,
}: PlaceMarkerProps) {
  return (
    <div
      className={cn('relative select-none', containerClassName)}
      onClick={onClick}
    >
      <div
        className={cn(
          'flex min-w-[91px] flex-col items-center rounded-lg border border-[#41424A] bg-white p-2',
          selected && 'bg-[#41424A]',
          className
        )}
      >
        <p
          className={cn(
            'whitespace-nowrap text-sm font-bold text-[#15161B]',
            selected && 'text-[#F3F3F7]'
          )}
        >
          {ellipsisText(title, titleMaxLength)}
        </p>
        <div className='flex items-center gap-[2px]'>
          <span
            className={cn(
              'text-xs text-[#8C8C94]',
              selected && 'text-[#B4B4BB]'
            )}
          >
            {distance}km
          </span>
          <Icon
            icon='BookmarkFill'
            className={cn(
              'size-4 text-[#15161B]',
              selected && 'text-[#F3F3F7]'
            )}
          />
          <Icon
            icon='Note'
            className={cn('size-4', selected && 'text-[#F3F3F7]')}
          />
        </div>
      </div>
      <svg
        className='absolute left-1/2 top-[calc(100%-8px)] -translate-x-1/2'
        width='16'
        height='17'
        viewBox='0 0 16 17'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M9.12012 13.751C8.66522 14.5797 7.52051 14.6315 6.97949 13.9062L6.87988 13.751L2.95508 6.60058C2.48775 5.7491 3.10396 4.70818 4.0752 4.70801L11.9248 4.70801C12.896 4.70818 13.5123 5.7491 13.0449 6.60059L9.12012 13.751Z'
          fill={selected ? '#41424A' : '#FFF'}
          stroke='#41424A'
        />
        <rect
          x='2'
          y='4.00073'
          width='12'
          height='3'
          fill={selected ? '#41424A' : '#FFF'}
        />
      </svg>
    </div>
  );
}
