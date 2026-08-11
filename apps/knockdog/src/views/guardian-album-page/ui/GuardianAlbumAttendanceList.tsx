'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

import {
  createGuardianAlbumAttendancePage,
  type GuardianAlbumAttendanceDay,
} from '@views/guardian-album-page/config/guardianAlbumAttendanceMock';
import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import { GuardianAlbumFilterDaySection } from '@views/guardian-album-page/ui/GuardianAlbumFilterDaySection';
import { useInfiniteScroll } from '@shared/lib/react/useInfiniteScroll';

interface GuardianAlbumAttendanceListProps {
  profileImage?: string | null;
  onScrollVisibilityChange?: (isVisible: boolean) => void;
  scrollRef?: RefObject<HTMLDivElement | null>;
}

function GuardianAlbumAttendanceList({
  profileImage,
  onScrollVisibilityChange,
  scrollRef: externalScrollRef,
}: GuardianAlbumAttendanceListProps) {
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const scrollRef = externalScrollRef ?? internalScrollRef;
  const [days, setDays] = useState<GuardianAlbumAttendanceDay[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const isInitializedRef = useRef(false);

  const loadPage = useCallback(
    (cursor: string | null) => {
      if (!profileImage) {
        setDays([]);
        setNextCursor(null);
        setHasNextPage(false);
        return;
      }

      setIsFetchingNextPage(true);
      const page = createGuardianAlbumAttendancePage({ cursor, profileImage });
      setDays((prev) => (cursor == null ? page.days : [...prev, ...page.days]));
      setNextCursor(page.nextCursor);
      setHasNextPage(page.nextCursor != null);
      setIsFetchingNextPage(false);
    },
    [profileImage]
  );

  useEffect(() => {
    isInitializedRef.current = false;
    setDays([]);
    setNextCursor(null);
    setHasNextPage(true);
    loadPage(null);
    isInitializedRef.current = true;
  }, [loadPage]);

  const fetchNextPage = useCallback(() => {
    if (!isInitializedRef.current || isFetchingNextPage || !hasNextPage) return;
    loadPage(nextCursor);
  }, [hasNextPage, isFetchingNextPage, loadPage, nextCursor]);

  const { lastElementCallback } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const handleScroll = () => {
    const node = scrollRef.current;
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
          <GuardianAlbumFilterDaySection key={day.dateKey} day={day} />
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
