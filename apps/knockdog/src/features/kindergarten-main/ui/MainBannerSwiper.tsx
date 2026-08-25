'use client';

import { useState } from 'react';
import { SwiperRoot, SwiperSlideItem } from '@knockdog/ui';

import { resolvePublicImageSrc } from '@shared/lib/utils/resolvePublicImageSrc';

interface MainBannerSwiperProps {
  images: string[];
}

function MainBannerSwiper({ images }: MainBannerSwiperProps) {
  const slides = images.filter(Boolean);
  const totalSlides = slides.length;
  const [currentSlide, setCurrentSlide] = useState(1);

  const handleSlideChange = (currentIndex: number) => {
    setCurrentSlide(currentIndex + 1);
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
              <div className='bg-fill-secondary-50 relative h-[292px] w-full'>
                {/* eslint-disable-next-line @next/next/no-img-element -- 목록 배너와 동일: CDN/한글 키는 Next Image remotePatterns 밖 */}
                <img
                  src={src}
                  alt={`업체 이미지 ${index + 1}`}
                  className='size-full object-cover'
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding='async'
                  referrerPolicy='no-referrer'
                />
              </div>
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
