'use client';

import { useState } from 'react';
import { Icon, SwiperRoot, SwiperSlideItem } from '@knockdog/ui';
import Image from 'next/image';

interface FullImageSliderProps {
  initialIndex?: number;
  images: string[];
  onIndexChange?: (index: number) => void;
}

export function FullImageSlider({ initialIndex = 0, images, onIndexChange }: FullImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleSlideChange = (currentIndex: number) => {
    setCurrentIndex(currentIndex);
    onIndexChange?.(currentIndex);
  };

  return (
    <div className='h-screen w-full'>
      <div className='flex h-full flex-col'>
        {/* 이미지 영역 */}
        <div className='relative min-h-0 flex-1'>
          <SwiperRoot navigation onSlideChange={handleSlideChange} className='h-full' initialIndex={initialIndex}>
            {images.map((image, index) => (
              <SwiperSlideItem key={index} className='h-full'>
                <div className='flex w-full items-center justify-center' style={{ height: 'calc(70vh)' }}>
                  <Image
                    src={image}
                    alt=''
                    width={0}
                    height={0}
                    sizes='100vw'
                    className='h-full w-full object-contain'
                  />
                </div>
              </SwiperSlideItem>
            ))}
          </SwiperRoot>
        </div>
        {/* 바텀 영역 */}
        <div className='mb-[84px] flex flex-shrink-0 items-center justify-center px-4 py-3'>
          <span className='text-text-accent'>{currentIndex + 1}</span>/{images.length}
        </div>
      </div>
    </div>
  );
}
