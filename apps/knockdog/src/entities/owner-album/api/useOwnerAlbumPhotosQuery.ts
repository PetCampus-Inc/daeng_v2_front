import { useInfiniteQuery } from '@tanstack/react-query';

import { mapAlbumPhotoDto } from '../lib/mapAlbumPhoto';
import { getAlbumPhotos } from './ownerAlbum';

const OWNER_ALBUM_PHOTOS_QUERY_KEY = 'ownerAlbumPhotos';

const ownerAlbumPhotosQueryKey = (schoolId?: number | null, userId?: string) =>
  [OWNER_ALBUM_PHOTOS_QUERY_KEY, schoolId, userId] as const;

interface UseOwnerAlbumPhotosInfiniteQueryOptions {
  schoolId?: number | null;
  userId?: string;
  size?: number;
  enabled?: boolean;
}

function useOwnerAlbumPhotosInfiniteQuery({
  schoolId,
  userId,
  size = 30,
  enabled = true,
}: UseOwnerAlbumPhotosInfiniteQueryOptions) {
  return useInfiniteQuery({
    queryKey: ownerAlbumPhotosQueryKey(schoolId, userId),
    queryFn: async ({ pageParam }) => {
      if (schoolId == null) {
        return { photos: [], nextCursor: null };
      }

      const response = await getAlbumPhotos({
        schoolId,
        cursor: pageParam,
        size,
      });

      return {
        photos: (response.data?.photos ?? []).map((photo, index) => mapAlbumPhotoDto(photo, index)),
        nextCursor: response.data?.nextCursor ?? null,
      };
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: enabled && schoolId != null,
    staleTime: 0,
  });
}

export {
  OWNER_ALBUM_PHOTOS_QUERY_KEY,
  ownerAlbumPhotosQueryKey,
  useOwnerAlbumPhotosInfiniteQuery,
};
