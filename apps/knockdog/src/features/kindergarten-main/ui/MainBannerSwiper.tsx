'use client';

import { useState } from 'react';
import { SwiperRoot, SwiperSlideItem } from '@knockdog/ui';
import Image from 'next/image';

interface MainBannerSwiperProps {
  images: string[];
}

function MainBannerSwiper({ images }: MainBannerSwiperProps) {
  const totalSlides = images.length;
  const [currentSlide, setCurrentSlide] = useState(1);

  const handleSlideChange = (currentIndex: number) => {
    setCurrentSlide(currentIndex + 1);
  };

  return (
    <div className='relative'>
      <SwiperRoot onSlideChange={handleSlideChange}>
        {images.map((image, index) => (
          <SwiperSlideItem key={index}>
            <div className='relative h-[292px] w-full'>
              <Image
                src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${image}`}
                alt={`업체 이미지 ${index + 1}`}
                fill
                sizes='100vw'
                className='object-cover'
                priority={index === 0}
              />
            </div>
          </SwiperSlideItem>
        ))}
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
