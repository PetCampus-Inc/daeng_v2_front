'use client';
'use client';

import Image from 'next/image';
import { overlay } from 'overlay-kit';
import { PriceFullImageSheet } from './PriceFullImageSheet';

interface PriceImageSliderProps {
  images: string[];
}

function PriceImageSlider({ images }: PriceImageSliderProps) {
  const handleImageClick = (index: number) => {
    overlay.open(({ isOpen, close }) => (
      <PriceFullImageSheet isOpen={isOpen} close={close} images={images} initialIndex={index} />
    ));
  };

  return (
    <div>
      <div className='mb-3'>
        <span className='body1-bold mr-1'>가격표</span>
        <span className='text-text-accent body1-bold'>{images.length}</span>
      </div>
      <div className='scrollbar-hide flex gap-[14px] overflow-x-auto'>
        {images.map((image, index) => (
          <button key={index} onClick={() => handleImageClick(index)}>
            <Image
              src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${image}`}
              alt=''
              className='h-[120px] w-[120px] rounded-lg object-cover'
              width={120}
              height={120}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export { PriceImageSlider };
