'use client';

import Image from 'next/image';
import { overlay } from 'overlay-kit';
import { PriceFullImageSheet } from './PriceFullImageSheet';

interface PriceImageSliderProps {
  images: string[];
  /** 썸네일 한 변 길이. 상세 기본 120, 원장 마이페이지 80 */
  thumbnailSize?: 80 | 120;
}

function PriceImageSlider({ images, thumbnailSize = 120 }: PriceImageSliderProps) {
  const handleImageClick = (index: number) => {
    overlay.open(({ isOpen, close }) => (
      <PriceFullImageSheet isOpen={isOpen} close={close} images={images} initialIndex={index} />
    ));
  };

  const gapClass = thumbnailSize === 80 ? 'gap-3' : 'gap-[14px]';
  const sizeClass = thumbnailSize === 80 ? 'h-20 w-20' : 'h-[120px] w-[120px]';

  return (
    <div>
      <div className='mb-3'>
        <span className='body1-bold mr-1'>가격표</span>
        <span className='text-text-accent body1-bold'>{images.length}</span>
      </div>
      <div className={`scrollbar-hide flex overflow-x-auto ${gapClass}`}>
        {images.map((image, index) => (
          <button key={index} onClick={() => handleImageClick(index)} className='shrink-0'>
            <Image
              src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${image}`}
              alt=''
              className={`${sizeClass} radius-r2 object-cover`}
              width={thumbnailSize}
              height={thumbnailSize}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export { PriceImageSlider };
