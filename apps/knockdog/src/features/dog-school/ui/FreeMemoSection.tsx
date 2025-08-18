'use client';

import { useState } from 'react';
import { Icon, Textarea, TextareaInput } from '@knockdog/ui';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PhotoUploader } from '@shared/ui/photo-uploader';

export function FreeMemoSection() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [memo] = useState('');

  if (!slug) return null;

  return (
    <div>
      <div className='flex items-center gap-1 py-3'>
        <Icon icon='Note' className='text-text-accent h-7 w-7' />
        <span className='h3-extrabold'>자유메모</span>
      </div>
      <div className='flex justify-between'>
        <span className='body1-regular'>자유롭게 메모를 작성하세요</span>

        {/* @TODO: 화면 이동 경로의 경우 상수 이용할것 */}
        <Link href={`/company/${slug}/edit-memo`} className='text-text-tertiary flex items-center gap-1'>
          <span className='label-semibold'>편집</span>
          <Icon icon='ChevronRight' className='h-4 w-4' />
        </Link>
      </div>
      <span className='body2-regular text-text-tertiary'>사진 최대 5개 등록 가능</span>
      <div className='py-3'>
        <Textarea cols={5} className='h-[144px]'>
          <TextareaInput readOnly value={memo} />
        </Textarea>
      </div>
      <PhotoUploader maxCount={5} />
    </div>
  );
}
