'use client';

import { useState } from 'react';
import { SwiperRoot, SwiperSlideItem } from '@knockdog/ui';
import Image from 'next/image';

// @TODO 추후, knockdog-ui swiper로 대체한다.
interface DogSchoolImageSwiperProps {
  images: string[];
}

export function DogSchoolImageSwiper({ images }: DogSchoolImageSwiperProps) {
  const totalSlides = images.length;
  const [currentSlide, setCurrentSlide] = useState(1);

  const handleSlideChange = (swiper: any) => {
    setCurrentSlide(swiper.activeIndex + 1);
  };

  return (
    <div className='relative'>
      <SwiperRoot onSlideChange={handleSlideChange}>
        {images.map((image, index) => (
          <SwiperSlideItem key={index}>
            <div className='h-[292px] w-full'>
              <Image src={image} alt='' fill className='object-cover' />
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
