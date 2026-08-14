'use client';

import { useQuery } from '@tanstack/react-query';

import {
  getGuardianAlbumDayPhotos,
  guardianAlbumDayPhotosQueryKey,
  toGuardianAlbumPhoto,
  type GuardianAlbumPhoto,
} from '@entities/guardian-album';
import { useUserStore } from '@entities/user';

/** 알림장 상세 앨범보기 — 1줄 4열 */
const NOTICE_ALBUM_PREVIEW_LIMIT = 4;
/** 초과분(+N) 산출용. 하루 앨범이 이보다 많으면 하한만 표시 */
const NOTICE_ALBUM_FETCH_SIZE = 100;

interface UseGuardianDailyNoticeDayAlbumParams {
  schoolId?: string | null;
  /** YYYY-MM-DD */
  date: string;
  enabled?: boolean;
}

interface GuardianDailyNoticeDayAlbum {
  photos: GuardianAlbumPhoto[];
  photoCount: number;
}

function useGuardianDailyNoticeDayAlbum({
  schoolId,
  date,
  enabled = true,
}: UseGuardianDailyNoticeDayAlbumParams) {
  const userId = useUserStore((state) => state.user?.userId);

  const query = useQuery({
    queryKey: [...guardianAlbumDayPhotosQueryKey(userId, schoolId ?? undefined, date), 'notice'],
    queryFn: async (): Promise<GuardianDailyNoticeDayAlbum> => {
      const response = await getGuardianAlbumDayPhotos({
        schoolId: schoolId!,
        date,
        size: NOTICE_ALBUM_FETCH_SIZE,
      });
      const photos = (response.data?.photos ?? [])
        .map(toGuardianAlbumPhoto)
        .filter((photo): photo is GuardianAlbumPhoto => photo != null);
      const hasNext = response.data?.hasNext === true;

      return {
        photos: photos.slice(0, NOTICE_ALBUM_PREVIEW_LIMIT),
        // hasNext면 정확한 총량은 알 수 없어 하한(가져온 장수)으로 표시
        photoCount: hasNext ? Math.max(photos.length + 1, NOTICE_ALBUM_FETCH_SIZE + 1) : photos.length,
      };
    },
    enabled: enabled && Boolean(userId) && Boolean(schoolId) && Boolean(date),
    staleTime: 60_000,
  });

  const photos = query.data?.photos ?? [];
  const photoCount = query.data?.photoCount ?? 0;

  return {
    photos,
    photoCount,
    hasPhotos: photos.length > 0,
    // disabled + no data면 isPending=true라 empty를 가림 → active fetch만 loading
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

export { NOTICE_ALBUM_PREVIEW_LIMIT, useGuardianDailyNoticeDayAlbum };
