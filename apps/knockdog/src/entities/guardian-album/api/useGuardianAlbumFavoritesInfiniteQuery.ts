import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';

import { toGuardianAlbumFavoritesPage } from '../model/guardianAlbumFavorites';
import type { GuardianAlbumFavoritesPage } from '../model/guardianAlbumFavorites';
import { getGuardianAlbumFavorites } from './guardianAlbumFavorites';

const GUARDIAN_ALBUM_FAVORITES_QUERY_KEY = 'guardianAlbumFavorites';

const guardianAlbumFavoritesQueryKey = (
  userId?: string,
  schoolId?: string,
  petId?: string,
  size?: number
) => [GUARDIAN_ALBUM_FAVORITES_QUERY_KEY, userId, schoolId, petId, size] as const;

type GuardianAlbumFavoritesCache = InfiniteData<GuardianAlbumFavoritesPage, string | undefined>;

interface UseGuardianAlbumFavoritesInfiniteQueryOptions {
  userId?: string;
  schoolId?: string | null;
  petId?: string | null;
  size?: number;
  enabled?: boolean;
}

function useGuardianAlbumFavoritesInfiniteQuery({
  userId,
  schoolId,
  petId,
  size = 7,
  enabled = true,
}: UseGuardianAlbumFavoritesInfiniteQueryOptions = {}) {
  return useInfiniteQuery({
    queryKey: guardianAlbumFavoritesQueryKey(userId, schoolId ?? undefined, petId ?? undefined, size),
    queryFn: async ({ pageParam }) => {
      const response = await getGuardianAlbumFavorites({
        schoolId: schoolId!,
        petId: petId!,
        cursor: pageParam,
        size,
      });

      return toGuardianAlbumFavoritesPage(response.data);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    enabled: enabled && Boolean(userId) && Boolean(schoolId) && Boolean(petId),
    staleTime: 0,
  });
}

export {
  GUARDIAN_ALBUM_FAVORITES_QUERY_KEY,
  guardianAlbumFavoritesQueryKey,
  useGuardianAlbumFavoritesInfiniteQuery,
};
export type { GuardianAlbumFavoritesCache };
