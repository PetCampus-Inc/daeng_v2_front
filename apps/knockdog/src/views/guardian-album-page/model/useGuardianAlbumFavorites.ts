'use client';

import { useMemo } from 'react';

import { useGuardianAlbumFavoritesInfiniteQuery } from '@entities/guardian-album';
import { useUserStore } from '@entities/user';

interface UseGuardianAlbumFavoritesParams {
  schoolId?: string | null;
  petId?: string | null;
  enabled?: boolean;
}

/**
 * 보호자 앨범 즐겨찾기 — `GET albums/{schoolId}/favorites?petId=&cursor=&size=`
 */
function useGuardianAlbumFavorites({
  schoolId,
  petId,
  enabled = true,
}: UseGuardianAlbumFavoritesParams) {
  const userId = useUserStore((state) => state.user?.userId);

  const query = useGuardianAlbumFavoritesInfiniteQuery({
    userId,
    schoolId,
    petId,
    enabled: enabled && Boolean(schoolId) && Boolean(petId),
  });

  const days = useMemo(
    () => query.data?.pages.flatMap((page) => page.days) ?? [],
    [query.data?.pages]
  );

  const hasFavoritePhotos = (query.data?.pages[0]?.days.length ?? 0) > 0;

  return {
    days,
    hasFavoritePhotos,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export { useGuardianAlbumFavorites };
