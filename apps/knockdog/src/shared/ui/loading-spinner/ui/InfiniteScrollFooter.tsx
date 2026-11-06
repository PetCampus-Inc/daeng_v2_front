'use client';

import { LoadingSpinner } from './LoadingSpinner';

interface InfiniteScrollFooterProps {
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  sentinelRef?: (node: HTMLDivElement | null) => void;
  className?: string;
}

/** infinite scroll sentinel + 추가 조회 스피너 */
function InfiniteScrollFooter({
  hasNextPage = false,
  isFetchingNextPage = false,
  sentinelRef,
  className,
}: InfiniteScrollFooterProps) {
  if (!hasNextPage) return null;

  return (
    <div className={className}>
      {isFetchingNextPage ? (
        <div className='flex justify-center py-4'>
          <LoadingSpinner layout='inline' />
        </div>
      ) : null}
      <div ref={sentinelRef} aria-hidden='true' className='h-4' />
    </div>
  );
}

export { InfiniteScrollFooter };
