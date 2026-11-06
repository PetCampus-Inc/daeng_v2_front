import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  deleteGuardianAlbumFavorite,
  postGuardianAlbumFavorite,
} from './guardianAlbumFavoriteMutation';
import { GUARDIAN_ALBUM_FAVORITES_QUERY_KEY } from './useGuardianAlbumFavoritesInfiniteQuery';
import { GUARDIAN_ALBUM_MONTH_QUERY_KEY } from './useGuardianAlbumMonthQuery';
import { GUARDIAN_ALBUM_TODAY_QUERY_KEY } from './useGuardianAlbumTodayQuery';

interface ToggleGuardianAlbumFavoriteParams {
  photoId: string;
  /** 토글 후 즐겨찾기 상태 */
  isFavorite: boolean;
}

interface UseGuardianAlbumFavoriteMutationOptions {
  userId?: string;
  schoolId?: string | null;
  petId?: string | null;
}

function useGuardianAlbumFavoriteMutation({
  userId,
  schoolId,
  petId,
}: UseGuardianAlbumFavoriteMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ photoId, isFavorite }: ToggleGuardianAlbumFavoriteParams) => {
      if (!schoolId) throw new Error('schoolId is required');

      return isFavorite
        ? postGuardianAlbumFavorite({ schoolId, photoId })
        : deleteGuardianAlbumFavorite({ schoolId, photoId });
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [GUARDIAN_ALBUM_TODAY_QUERY_KEY, userId, schoolId, petId],
        }),
        queryClient.invalidateQueries({
          queryKey: [GUARDIAN_ALBUM_MONTH_QUERY_KEY, userId, schoolId, petId],
        }),
        queryClient.invalidateQueries({
          queryKey: [GUARDIAN_ALBUM_FAVORITES_QUERY_KEY, userId, schoolId, petId],
        }),
      ]);
    },
  });
}

export { useGuardianAlbumFavoriteMutation };
export type { ToggleGuardianAlbumFavoriteParams };
