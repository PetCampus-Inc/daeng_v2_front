'use client';

import type { ReactNode } from 'react';
import { cn } from '@knockdog/ui/lib';

import { usePullToRefresh } from '@shared/lib/react/usePullToRefresh';
import { LoadingSpinner } from '@shared/ui/loading-spinner';

interface PullToRefreshProps {
  onRefresh: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

/** 최상단 pull-to-refresh — 레이아웃 유지 + 상단 LoadingSpinner */
function PullToRefresh({ onRefresh, disabled = false, className, children }: PullToRefreshProps) {
  const { containerRef, pullDistance, isRefreshing, isPulling } = usePullToRefresh({
    onRefresh,
    disabled,
  });

  const indicatorHeight = isRefreshing ? 90 : pullDistance;

  return (
    <div
      ref={containerRef}
      className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain', className)}
    >
      <div
        className='flex w-full shrink-0 items-center justify-center overflow-hidden transition-[height] duration-150 ease-out'
        style={{ height: indicatorHeight }}
        aria-hidden={!isPulling}
      >
        {isPulling ? <LoadingSpinner layout='inline' /> : null}
      </div>
      {children}
    </div>
  );
}

export { PullToRefresh };
export type { PullToRefreshProps };
