'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Icon } from '@knockdog/ui';

import type { InquiryPhoto } from '../lib/uploadInquiryPhotos';
import { INQUIRY_IMAGE_MAX_COUNT } from '@entities/inquiry';
import { Skeleton } from '@shared/ui/skeleton';

const SLIDER_THUMB_WIDTH = 50;

interface InquiryPhotoFieldProps {
  photos: InquiryPhoto[];
  uploadingCount: number;
  canAddPhoto: boolean;
  onAdd: () => void;
  onRemove: (tempKey: string) => void;
}

/** 사진 등록: [+] 버튼(등록 매수 n/5) 오른쪽에 썸네일을 가로로 나열. 화면을 넘을 때만 슬라이더를 보여준다 */
function InquiryPhotoField({ photos, uploadingCount, canAddPhoto, onAdd, onRemove }: InquiryPhotoFieldProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [slider, setSlider] = useState({ visible: false, left: 0 });

  const updateSlider = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const maxScroll = element.scrollWidth - element.clientWidth;
    const visible = maxScroll > 1;
    const maxLeft = Math.max(element.clientWidth - SLIDER_THUMB_WIDTH, 0);
    setSlider({ visible, left: visible ? (element.scrollLeft / maxScroll) * maxLeft : 0 });
  }, []);

  useEffect(() => {
    updateSlider();
    const element = scrollRef.current;
    if (!element) return;

    const observer = new ResizeObserver(updateSlider);
    observer.observe(element);
    return () => observer.disconnect();
  }, [photos.length, uploadingCount, updateSlider]);

  return (
    <div className='gap-x2 px-x4 py-x3 flex flex-col'>
      <p className='body2-bold text-text-primary'>사진 등록</p>

      <div ref={scrollRef} className='scrollbar-hide gap-x2 flex overflow-x-auto' onScroll={updateSlider}>
        {/* Figma 96×96: 테두리가 크기에 더해지지 않도록 안쪽 ring으로 그린다 */}
        <button
          type='button'
          aria-label='사진 추가'
          disabled={!canAddPhoto}
          onClick={onAdd}
          className='bg-bg-0 ring-line-200 radius-r2 gap-x1 disabled:bg-fill-secondary-50 flex size-24 shrink-0 flex-col items-center justify-center ring-1 ring-inset'
        >
          <Icon icon='Plus' className='text-fill-secondary-400 size-5' />
          <span className='caption1-semibold text-text-caption'>
            {photos.length}/{INQUIRY_IMAGE_MAX_COUNT}
          </span>
        </button>

        {photos.map((photo) => (
          <div key={photo.tempKey} className='relative size-24 shrink-0'>
            {/* eslint-disable-next-line @next/next/no-img-element -- 업로드한 사진 미리보기 (로컬 URL) */}
            <img src={photo.previewUrl} alt='' className='radius-r3 size-full object-cover' />
            {/* 간격 토큰(top-x1)은 위치 속성에서 4px로 계산되지 않아(96px) 기본 단위를 쓴다 */}
            <button
              type='button'
              aria-label='사진 삭제'
              className='absolute top-1 right-1 inline-flex size-5 items-center justify-center'
              onClick={() => onRemove(photo.tempKey)}
            >
              <Icon icon='DeleteInput' className='text-fill-secondary-700 !size-5' />
            </button>
          </div>
        ))}

        {Array.from({ length: uploadingCount }, (_, index) => (
          <Skeleton key={`uploading-${index}`} className='radius-r3 size-24 shrink-0' />
        ))}
      </div>

      {slider.visible ? (
        <div className='py-x2'>
          <div className='bg-bg-50 radius-full relative h-1 w-full'>
            <div
              className='bg-fill-secondary-700 radius-full absolute top-0 h-1'
              style={{ width: SLIDER_THUMB_WIDTH, transform: `translateX(${slider.left}px)` }}
            />
          </div>
        </div>
      ) : null}

      {/* 줄 높이는 Figma 18px (caption1 토큰은 16px) */}
      <p className='caption1-semibold text-text-caption leading-[18px]'>20MB이하 JPG·JPEG·PNG·HEIC·HEIF</p>
    </div>
  );
}

export { InquiryPhotoField };
