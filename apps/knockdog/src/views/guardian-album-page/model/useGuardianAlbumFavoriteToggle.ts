'use client';

import { useCallback } from 'react';

import { useGuardianAlbumFavoriteMutation } from '@entities/guardian-album';
import { useUserStore } from '@entities/user';
import { trackAlbumAction } from '@shared/lib/analytics';
import { isGuardianAlbumExpandPhotoId } from '@views/guardian-album-page/lib/guardianAlbumPhotoId';

interface UseGuardianAlbumFavoriteToggleParams {
  schoolId?: string | null;
  petId?: string | null;
}

function useGuardianAlbumFavoriteToggle({
  schoolId,
  petId,
}: UseGuardianAlbumFavoriteToggleParams) {
  const userId = useUserStore((state) => state.user?.userId);
  const { mutateAsync, isPending } = useGuardianAlbumFavoriteMutation({
    userId,
    schoolId,
    petId,
  });

  const toggleFavorite = useCallback(
    async (photoId: string, isFavorite: boolean) => {
      if (!schoolId || isGuardianAlbumExpandPhotoId(photoId)) return;
      await mutateAsync({ photoId, isFavorite });
      if (isFavorite) {
        trackAlbumAction({ action: 'favorite', role: 'guardian' });
      }
    },
    [mutateAsync, schoolId]
  );

  return {
    toggleFavorite,
    isPending,
  };
}

export { useGuardianAlbumFavoriteToggle };
