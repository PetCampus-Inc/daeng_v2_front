'use client';

import Image from 'next/image';
import { overlay } from 'overlay-kit';

import { ImageGalleryViewer } from '@shared/ui/image-gallery-viewer';

interface PriceImageSliderProps {
  images: string[];
  /** 썸네일 한 변 길이. 상세 기본 120, 원장 마이페이지 80 */
  thumbnailSize?: 80 | 120;
}

function toImageUrl(image: string) {
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? ''}${image}`;
}

function PriceImageSlider({ images, thumbnailSize = 120 }: PriceImageSliderProps) {
  const imageUrls = images.map(toImageUrl);

  const handleImageClick = (index: number) => {
    overlay.open(({ isOpen, close }) => (
      <ImageGalleryViewer
        isOpen={isOpen}
        close={close}
        images={imageUrls}
        initialIndex={index}
        ariaLabel='가격표 사진 보기'
      />
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
        {imageUrls.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type='button'
            onClick={() => handleImageClick(index)}
            className='shrink-0'
          >
            <Image
              src={image}
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
