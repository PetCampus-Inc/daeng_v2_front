'use client';

import { useState } from 'react';
import { Icon, Textarea, TextareaInput } from '@knockdog/ui';
import { useParams } from 'next/navigation';
import { PhotoUploader } from '@shared/ui/photo-uploader';
import { useMemoQuery } from '../api/useMemoQuery';
import type { Photo } from '@entities/memo';
import { useStackNavigation } from '@shared/lib/bridge';

const MEMO_PHOTO_MAX_COUNT = 5;

export function FreeMemoSection() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { push } = useStackNavigation();

  if (!id) throw new Error('Company ID is required for free memo section');

  const { data: memo = { content: '', photos: [] } } = useMemoQuery(id);
  const [photos, setPhotos] = useState<Photo[]>(memo?.photos ?? []);

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
      {/* @TODO: API 수정 완료시, 여기도 수정 필욘 */}
      <PhotoUploader maxCount={MEMO_PHOTO_MAX_COUNT} />
    </div>
  );
}
