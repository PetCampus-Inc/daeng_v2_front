'use client';

import { type MouseEvent, type PointerEvent, useRef, useState } from 'react';
import { SwiperRoot, SwiperSlideItem } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { resolvePublicImageSrc } from '@shared/lib/utils/resolvePublicImageSrc';
import { KindergartenImageViewer } from './KindergartenImageViewer';

interface MainBannerSwiperProps {
  images: string[];
}

function MainBannerSwiper({ images }: MainBannerSwiperProps) {
  const slides = images.filter(Boolean);
  const totalSlides = slides.length;
  const [currentSlide, setCurrentSlide] = useState(1);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const wasDraggingRef = useRef(false);
  const imageUrls = slides.map((image) => resolvePublicImageSrc(image));

  const handleSlideChange = (currentIndex: number) => {
    setCurrentSlide(currentIndex + 1);
  };

  const handleImageClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Keyboard-generated clicks have detail=0 and should not be affected by a prior pointer drag.
    if (event.detail > 0 && wasDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }
    wasDraggingRef.current = false;

    overlay.open(({ isOpen, unmount }) => (
      <KindergartenImageViewer
        isOpen={isOpen}
        images={imageUrls}
        initialIndex={currentSlide - 1}
        onClose={unmount}
      />
    ));
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    wasDraggingRef.current = false;
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const pointerStart = pointerStartRef.current;
    if (!pointerStart) return;

    if (Math.abs(event.clientX - pointerStart.x) > 8 || Math.abs(event.clientY - pointerStart.y) > 8) {
      wasDraggingRef.current = true;
    }
  };

  // 이미지 없으면 플레이스홀더도 렌더하지 않음.
  // 빈 영역 + MainBox `-mt-8` 오버랩이면 배너 배경에 이름이 가려져 잘려 보임.
  if (totalSlides === 0) {
    return null;
  }

  return (
    <div className='relative'>
      <SwiperRoot onSlideChange={handleSlideChange}>
        {slides.map((image, index) => {
          const src = resolvePublicImageSrc(image);
          return (
            <SwiperSlideItem key={`${image}-${index}`}>
              <button
                type='button'
                aria-label={`사진 ${index + 1} 확대 보기`}
                className='bg-fill-secondary-50 relative block h-[292px] w-full cursor-pointer border-0 p-0 text-left'
                onClick={handleImageClick}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={() => {
                  pointerStartRef.current = null;
                }}
                onPointerLeave={() => {
                  pointerStartRef.current = null;
                }}
                onPointerCancel={() => {
                  pointerStartRef.current = null;
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- 목록 배너와 동일: CDN/한글 키는 Next Image remotePatterns 밖 */}
                <img
                  src={src}
                  alt={`업체 이미지 ${index + 1}`}
                  className='size-full object-cover'
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding='async'
                  draggable={false}
                  referrerPolicy='no-referrer'
                />
              </button>
            </SwiperSlideItem>
          );
        })}
      </SwiperRoot>

      {/* 슬라이더 카운터 영역 */}
      <div className='z-5 absolute bottom-10 right-4 rounded-xl bg-[#0F141A] px-[10px] py-[3px] opacity-70'>
        <div className='text-xs text-white'>
          {currentSlide} / {totalSlides}
        </div>
      </div>
    </div>
  );
}

export { MainBannerSwiper };
