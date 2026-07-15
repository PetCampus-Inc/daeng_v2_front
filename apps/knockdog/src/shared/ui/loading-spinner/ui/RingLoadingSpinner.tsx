'use client';

import { cn } from '@knockdog/ui/lib';

interface RingLoadingSpinnerProps {

  size?: number;
  className?: string;
}

/** 반원 주황/회색 링, 시계방향 회전 */
function RingLoadingSpinner({ size = 40, className }: RingLoadingSpinnerProps) {
  return (
    <svg
      className={cn('animate-spin', className)}
      width={size}
      height={size}
      viewBox='0 0 40 40'
      fill='none'
      role='status'
      aria-label='로딩 중'
    >
      <circle
        cx='20'
        cy='20'
        r='16'
        className='stroke-line-200'
        strokeWidth='4'
        strokeLinecap='round'
      />
      <path
        d='M4 20a16 16 0 0 1 32 0'
        className='stroke-fill-primary-500'
        strokeWidth='4'
        strokeLinecap='round'
      />
    </svg>
  );
}

export { RingLoadingSpinner, type RingLoadingSpinnerProps };
