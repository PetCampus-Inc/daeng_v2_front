'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

import { useGuardianAlbumDayPreviewEnrichment } from '@entities/guardian-album';
import { useUserStore } from '@entities/user';
import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import type { GuardianAlbumFilterDay } from '@views/guardian-album-page/ui/GuardianAlbumFilterDaySection';
import { GuardianAlbumFilterDaySection } from '@views/guardian-album-page/ui/GuardianAlbumFilterDaySection';
import { useInfiniteScroll } from '@shared/lib/react/useInfiniteScroll';

interface GuardianAlbumAttendanceListProps {
  days: GuardianAlbumFilterDay[];
  schoolId?: string | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  onDayClick?: (day: GuardianAlbumFilterDay) => void;
  onScrollVisibilityChange?: (isVisible: boolean) => void;
  scrollRef?: RefObject<HTMLDivElement | null>;
}

function GuardianAlbumAttendanceDayItem({
  day,
  schoolId,
  rootRef,
  onClick,
}: {
  day: GuardianAlbumFilterDay;
  schoolId?: string | null;
  rootRef?: RefObject<HTMLDivElement | null>;
  onClick?: (day: GuardianAlbumFilterDay) => void;
}) {
  const userId = useUserStore((state) => state.user?.userId);
  const itemRef = useRef<HTMLDivElement>(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (hasBeenVisible) return;
    const node = itemRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setHasBeenVisible(true);
      },
      { root: rootRef?.current ?? null, rootMargin: '200px', threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasBeenVisible, rootRef]);

  const { day: previewDay } = useGuardianAlbumDayPreviewEnrichment({
    userId,
    schoolId,
    day,
    enabled: hasBeenVisible,
  });

  return (
    <div ref={itemRef}>
      <GuardianAlbumFilterDaySection day={previewDay} onClick={onClick} />
    </div>
  );
}

function GuardianAlbumAttendanceList({
  days,
  schoolId,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onDayClick,
  onScrollVisibilityChange,
  scrollRef,
}: GuardianAlbumAttendanceListProps) {
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
          <GuardianAlbumAttendanceDayItem
            key={day.dateKey}
            day={day}
            schoolId={schoolId}
            rootRef={scrollRef}
            onClick={onDayClick}
          />
        ))}
        {hasNextPage ? (
          <div ref={lastElementCallback} aria-hidden='true' className='h-4' />
        ) : days.length > 0 ? (
          <p className='body1-medium text-text-secondary py-4 text-center'>
            {guardianAlbumContent.favoriteList.endMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export { GuardianAlbumAttendanceList };
