'use client';

import { useCallback, useMemo } from 'react';
import { Icon, Textarea, TextareaInput } from '@knockdog/ui';
import { useParams } from 'next/navigation';
import { PhotoUploader } from '@shared/ui/photo-uploader';
import { useMemoQuery } from '../api/useMemoQuery';
import { useMemoMutation } from '../api/useMemoMutation';
import { useStackNavigation } from '@shared/lib/bridge';
import { useMoveImageMutation } from '@shared/lib/media';
import type { WebImageAsset } from '@shared/lib/media';
import { useUserStore } from '@entities/user';

const MEMO_PHOTO_MAX_COUNT = 5;

export function FreeMemoSection() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { push } = useStackNavigation();
  const user = useUserStore((state) => state.user);

  if (!id) throw new Error('Company ID is required for free memo section');

  const { data: memo = { content: '', photos: [] } } = useMemoQuery(id);
  const { mutate: updateMemo } = useMemoMutation();
  const { mutateAsync: moveImageAsync } = useMoveImageMutation();

  const defaultPhotos = useMemo<WebImageAsset[]>(() => {
    const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';
    return memo.photos.map((photo) => {
      const imageUrl = `${imageBaseUrl}${photo.key}`;
      return {
        key: photo.key,
        preSignedUrl: imageUrl,
        uri: imageUrl,
      };
    });
  }, [memo.photos]);

  const handlePhotosChange = useCallback(
    async (assets: WebImageAsset[]) => {
      if (!user?.userId) {
        console.error('User ID is required');
        return;
      }

      // 기존 사진들의 key 목록
      const existingPhotoKeys = new Set(memo.photos.map((photo) => photo.key));

      // 새로 추가된 사진만 필터링 (기존 사진의 key에 없는 것들)
      const newAssets = assets.filter((asset) => !existingPhotoKeys.has(asset.key));

      // 기존 사진들의 key는 그대로 사용
      const existingKeys = assets.filter((asset) => existingPhotoKeys.has(asset.key)).map((asset) => asset.key);

      let finalPhotoKeys: string[] = [...existingKeys];

      // 새로 추가된 사진만 이동
      if (newAssets.length > 0) {
        try {
          const movedPhotos = await Promise.all(
            newAssets.map(async (asset) => {
              const moveResponse = await moveImageAsync({
                key: asset.key,
                path: `kindergarten/${id}/memo/${user.userId}`,
              });
              // URL에서 경로 부분만 추출 (예: https://...amazonaws.com/user/... -> user/...)
              if (moveResponse.data) {
                try {
                  const url = new URL(moveResponse.data);
                  return url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
                } catch {
                  // URL이 아닌 경우 그대로 반환 (이미 경로일 수 있음)
                  return moveResponse.data;
                }
              }
              return null;
            })
          );
          const newKeys = movedPhotos.filter((url): url is string => !!url);
          finalPhotoKeys = [...existingKeys, ...newKeys];
        } catch (error) {
          console.error('이미지 이동 실패:', error);
          return;
        }
      }

      // 메모 업데이트 (content는 기존 값 유지, photos만 업데이트)
      updateMemo({ targetId: id, content: memo?.content, photoKeys: finalPhotoKeys });
    },
    [id, memo?.content, memo.photos, user?.userId, moveImageAsync, updateMemo]
  );

  return (
    <div>
      <div className='flex items-center gap-1 py-3'>
        <Icon icon='Note' className='text-text-accent h-7 w-7' />
        <span className='h3-extrabold'>자유메모</span>
      </div>
      <div className='flex justify-between'>
        <span className='body1-regular'>자유롭게 메모를 작성하세요</span>

        {/* @TODO: 화면 이동 경로의 경우 상수 이용할것 */}
        <button
          onClick={() => push({ pathname: `/kindergarten/${id}/edit-memo` })}
          className='text-text-tertiary flex items-center gap-1'
        >
          <span className='label-semibold'>편집</span>
          <Icon icon='ChevronRight' className='h-4 w-4' />
        </button>
      </div>
      <span className='body2-regular text-text-tertiary'>사진 최대 {MEMO_PHOTO_MAX_COUNT}개 등록 가능</span>
      <div className='py-3'>
        <Textarea cols={5} className='h-[144px]'>
          <TextareaInput readOnly value={memo?.content ?? ''} />
        </Textarea>
      </div>
      <PhotoUploader maxCount={MEMO_PHOTO_MAX_COUNT} defaultValue={defaultPhotos} onChange={handlePhotosChange} />
    </div>
  );
}
