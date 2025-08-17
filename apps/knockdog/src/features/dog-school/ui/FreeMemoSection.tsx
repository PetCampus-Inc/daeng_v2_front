'use client';

import { Icon, TextArea } from '@knockdog/ui';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PhotoUploader } from '@shared/ui/photo-uploader';

export function FreeMemoSection() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

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
        <div className='bg-primitive-neutral-50 rounded-lg px-4 py-3'>
          <textarea
            readOnly
            cols={5}
            className='bg-primitive-neutral-50 body1-regular h-[144px] w-full'
            value='우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리는 말이에요 우에요 우리 뽀삐는 말이에요 뽀삐는 말뽀삐는 말말우리 우리뽀삐우리별이 우리 달이 강아지 고양이 귀여워'
          />
        </div>
      </div>
      <PhotoUploader maxCount={5} />
    </div>
  );
}
