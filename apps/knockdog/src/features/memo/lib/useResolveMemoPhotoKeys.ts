import { useCallback } from 'react';
import { useMoveImageMutation } from '@shared/lib/media';
import { useUserStore } from '@entities/user';

function toStoragePath(movedUrl: string) {
  try {
    const url = new URL(movedUrl);
    return url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
  } catch {
    return movedUrl;
  }
}


//기존 메모 사진 key는 유지하고, 새로 추가된 임시 업로드 key만 메모 경로로 이동시켜 최종 key 목록을 반환

export function useResolveMemoPhotoKeys(kindergartenId: string) {
  const userId = useUserStore((state) => state.user?.userId);
  const { mutateAsync: moveImageAsync } = useMoveImageMutation();

  return useCallback(
    async (nextKeys: string[], existingKeys: string[]) => {
      if (!userId) throw new Error('User ID is required');

      const existingKeySet = new Set(existingKeys);

      return Promise.all(
        nextKeys.map(async (key) => {
          if (existingKeySet.has(key)) return key;

          const { data } = await moveImageAsync({ key, path: `kindergarten/${kindergartenId}/memo/${userId}` });
          if (!data) throw new Error('이미지 이동 실패');
          return toStoragePath(data);
        })
      );
    },
    [kindergartenId, moveImageAsync, userId]
  );
}
