'use client';

import { useCallback, type RefObject } from 'react';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import type { GuardianAlbumFilterDay } from '@views/guardian-album-page/ui/GuardianAlbumFilterDaySection';
import { GuardianAlbumFilterDaySection } from '@views/guardian-album-page/ui/GuardianAlbumFilterDaySection';
import { useInfiniteScroll } from '@shared/lib/react/useInfiniteScroll';
import { InfiniteScrollFooter } from '@shared/ui/loading-spinner';

interface GuardianAlbumFavoriteListProps {
  days: GuardianAlbumFilterDay[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  onDayClick?: (day: GuardianAlbumFilterDay) => void;
  onScrollVisibilityChange?: (isVisible: boolean) => void;
  scrollRef?: RefObject<HTMLDivElement | null>;
}

function GuardianAlbumFavoriteList({
  days,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onDayClick,
  onScrollVisibilityChange,
  scrollRef,
}: GuardianAlbumFavoriteListProps) {
  const handleFetchNextPage = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  const { lastElementCallback } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage: handleFetchNextPage,
  });

  const handleScroll = () => {
    const node = scrollRef?.current;
    if (!node || !onScrollVisibilityChange) return;
    onScrollVisibilityChange(node.scrollTop > 120);
  };

  return (
    <div
      ref={scrollRef}
      className='bg-bg-0 min-h-0 w-full flex-1 overflow-y-auto'
      onScroll={handleScroll}
    >
      <div className='flex w-full flex-col gap-5 px-4 py-5'>
        {days.map((day) => (
          <GuardianAlbumFilterDaySection
            key={day.dateKey}
            day={day}
            overflowLabel={guardianAlbumContent.favoriteList.overflowLabel}
            onClick={onDayClick}
          />
        ))}
        {hasNextPage ? (
          <InfiniteScrollFooter
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            sentinelRef={lastElementCallback}
          />
        ) : days.length > 0 ? (
          <p className='body1-medium text-text-secondary py-4 text-center'>
            {guardianAlbumContent.favoriteList.endMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export { GuardianAlbumFavoriteList };
