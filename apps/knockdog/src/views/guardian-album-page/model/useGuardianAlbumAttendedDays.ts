'use client';

import { useMemo } from 'react';

import { useGuardianAlbumAttendedDaysInfiniteQuery } from '@entities/guardian-album';
import { useUserStore } from '@entities/user';

interface UseGuardianAlbumAttendedDaysParams {
  schoolId?: string | null;
  petId?: string | null;
  enabled?: boolean;
}

/**
 * 보호자 앨범 등원일 — `GET albums/{schoolId}/attended-days?petId=&cursor=&size=`
 * 프리뷰 6장 보강은 리스트에서 화면에 들어온 카드만 수행한다.
 */
function useGuardianAlbumAttendedDays({
  schoolId,
  petId,
  enabled = true,
}: UseGuardianAlbumAttendedDaysParams) {
  const userId = useUserStore((state) => state.user?.userId);

  const query = useGuardianAlbumAttendedDaysInfiniteQuery({
    userId,
    schoolId,
    petId,
    enabled: enabled && Boolean(schoolId) && Boolean(petId),
  });

  const days = useMemo(
    () => query.data?.pages.flatMap((page) => page.days) ?? [],
    [query.data?.pages]
  );

  const hasAttendancePhotos = (query.data?.pages[0]?.days.length ?? 0) > 0;

  return {
    days,
    hasAttendancePhotos,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export { useGuardianAlbumAttendedDays };
