'use client';

import { useMemo } from 'react';

import { useGuardianAlbumAttendedDaysInfiniteQuery } from '@entities/guardian-album';
import { useGuardianAlbumAttendedPreviewEnrichment } from '@entities/guardian-album/api/useGuardianAlbumAttendedPreviewEnrichment';
import { useUserStore } from '@entities/user';

interface UseGuardianAlbumAttendedDaysParams {
  schoolId?: string | null;
  petId?: string | null;
  enabled?: boolean;
}

/**
 * 보호자 앨범 등원일 — `GET albums/{schoolId}/attended-days?petId=&cursor=&size=`
 * previewPhotos가 4장으로 잘리면 `GET albums/{schoolId}/photos?date=`로 최대 6장까지 보완.
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

  const baseDays = useMemo(
    () => query.data?.pages.flatMap((page) => page.days) ?? [],
    [query.data?.pages]
  );

  const { days } = useGuardianAlbumAttendedPreviewEnrichment({
    userId,
    schoolId,
    days: baseDays,
    enabled: enabled && Boolean(schoolId) && Boolean(petId) && baseDays.length > 0,
  });

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
