import React from 'react';

import { cn } from '@knockdog/ui/lib';
import { Icon } from '@knockdog/ui';
import { ellipsisText } from '@shared/utils';

interface PlaceMarkerProps {
  title: string;
  titleMaxLength?: number;
  distance?: string | number;
  selected?: boolean;
  className?: string;
  onClick?: () => void;
}

export function PlaceMarker({ title, titleMaxLength = 7, distance, selected, className, onClick }: PlaceMarkerProps) {
  return (
    <div className='relative select-none' onClick={onClick}>
      <div
        className={cn(
          'border-line-700 bg-fill-secondary-0 radius-r2 p-x2 flex min-w-[91px] flex-col items-center border',
          selected && 'bg-fill-secondary-700',
          className
        )}
      >
        <p className={cn('body2-bold text-text-primary whitespace-nowrap', selected && 'text-text-primary-inverse')}>
          {ellipsisText(title, titleMaxLength)}
        </p>
        <div className='gap-x0_5 flex items-center'>
          <span className={cn('text-text-tertiary caption1-semibold', selected && 'text-text-secondary-inverse')}>
            {distance}km
          </span>
          <Icon
            icon='BookmarkFill'
            className={cn('text-fill-secondary-700 size-x4', selected && 'text-text-primary-inverse')}
          />
          <Icon
            icon='Note'
            className={cn('text-fill-secondary-700 size-x4', selected && 'text-text-primary-inverse')}
          />
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
          className={cn('stroke-fill-secondary-700 fill-fill-secondary-0', selected && 'fill-fill-secondary-700')}
          d='M9.12012 13.751C8.66522 14.5797 7.52051 14.6315 6.97949 13.9062L6.87988 13.751L2.95508 6.60058C2.48775 5.7491 3.10396 4.70818 4.0752 4.70801L11.9248 4.70801C12.896 4.70818 13.5123 5.7491 13.0449 6.60059L9.12012 13.751Z'
        />
        <rect
          className={cn('fill-fill-secondary-0', selected && 'fill-fill-secondary-700')}
          x='2'
          y='4.00073'
          width='12'
          height='3'
        />
      </svg>
    </div>
  );
}
