'use client';

import { useCallback, useMemo } from 'react';
import { ActionButton, Icon, Textarea, TextareaInput } from '@knockdog/ui';
import { useParams } from 'next/navigation';
import { PhotoUploader } from '@shared/ui/photo-uploader';
import { useMemoQuery } from '../api/useMemoQuery';
import { useMemoMutation } from '../api/useMemoMutation';
import { useResolveMemoPhotoKeys } from '../lib/useResolveMemoPhotoKeys';
import { toMemoPhotoUrl } from '../lib/toMemoPhotoUrl';
import { useStackNavigation } from '@shared/lib/bridge';
import type { WebImageAsset } from '@shared/lib/media';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';

const MEMO_PHOTO_MAX_COUNT = 5;

interface FreeMemoSectionProps {
  kindergartenId?: string;
}

export function FreeMemoSection({ kindergartenId }: FreeMemoSectionProps) {
  const params = useParams<{ id: string }>();
  const id = kindergartenId ?? params?.id;
  const { push } = useStackNavigation();

  if (!id) throw new Error('Company ID is required for free memo section');

  const { data: memo = { content: '', photos: [] }, isLoading } = useMemoQuery(id);
  const { mutate: updateMemo } = useMemoMutation();
  const resolvePhotoKeys = useResolveMemoPhotoKeys(id);

  const defaultPhotos = useMemo<WebImageAsset[]>(
    () =>
      memo.photos.map((photo) => {
        const imageUrl = toMemoPhotoUrl(photo.key);
        return { key: photo.key, preSignedUrl: imageUrl, uri: imageUrl };
      }),
    [memo.photos]
  );

  const handlePhotosChange = useCallback(
    async (assets: WebImageAsset[]) => {
      try {
        const photoKeys = await resolvePhotoKeys(
          assets.map((asset) => asset.key),
          memo.photos.map((photo) => photo.key)
        );
        updateMemo({ targetId: id, content: memo.content, photoKeys });
      } catch (error) {
        console.error('이미지 이동 실패:', error);
      }
    },
    [id, memo.content, memo.photos, resolvePhotoKeys, updateMemo]
  );

  const handleEditMemo = () => push({ pathname: `/kindergarten/${id}/edit-memo` });

  const header = (
    <div className='flex items-center gap-1 py-3'>
      <Icon icon='Note' className='text-text-accent h-6 w-6' />
      <span className='h3-extrabold'>자유메모</span>
    </div>
  );

  if (isLoading)
    return (
      <div>
        {header}
        <DelayedLoadingSpinner isLoading={isLoading} layout='inline' className='py-8' />
      </div>
    );

  const isEmpty = !memo.content?.trim() && memo.photos.length === 0;

  if (isEmpty)
    return (
      <div>
        {header}
        <p className='body1-medium text-text-tertiary p-4 text-center'>자유롭게 유치원 메모를 작성하세요</p>
        <div className='pb-4'>
          <ActionButton variant='secondaryLine' onClick={handleEditMemo}>
            자유메모 작성하기
          </ActionButton>
        </div>
      </div>
    );

  return (
    <div>
      {header}
      <div className='flex justify-between'>
        <span className='body1-regular'>자유롭게 메모를 작성하세요</span>

        {/* @TODO: 화면 이동 경로의 경우 상수 이용할것 */}
        <button
          onClick={handleEditMemo}
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
      <div className='overflow-y-auto'>
        <PhotoUploader maxCount={MEMO_PHOTO_MAX_COUNT} defaultValue={defaultPhotos} onChange={handlePhotosChange} />
      </div>
    </div>
  );
}
