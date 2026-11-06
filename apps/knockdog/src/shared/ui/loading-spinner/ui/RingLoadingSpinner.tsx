'use client';

import { cn } from '@knockdog/ui/lib';

interface RingLoadingSpinnerProps {

  size?: number;
  className?: string;
}

/** 이미지·파일 업로드 전용. 그 외 로딩은 LoadingSpinner / DelayedLoadingSpinner 사용 */
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
