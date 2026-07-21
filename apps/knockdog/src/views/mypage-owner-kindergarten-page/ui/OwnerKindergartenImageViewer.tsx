'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@knockdog/ui';
import Image from 'next/image';
import { RemoveScroll } from 'react-remove-scroll';

interface OwnerKindergartenImageViewerProps {
  isOpen: boolean;
  close: () => void;
  images: string[];
  initialIndex?: number;
}

function OwnerKindergartenImageViewer({
  isOpen,
  close,
  images,
  initialIndex = 0,
}: OwnerKindergartenImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (!isOpen || images.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') {
        setCurrentIndex((index) => (index - 1 + images.length) % images.length);
      }
      if (event.key === 'ArrowRight') {
        setCurrentIndex((index) => (index + 1) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close, images.length, isOpen]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] ?? images[0];
  if (!currentImage) return null;

  const handlePreviousClick = () => {
    setCurrentIndex((index) => (index - 1 + images.length) % images.length);
  };

  const handleNextClick = () => {
    setCurrentIndex((index) => (index + 1) % images.length);
  };

  return (
    <RemoveScroll forwardProps>
      <div
        role='dialog'
        aria-modal='true'
        aria-label='유치원 사진 보기'
        className='z-modal fixed inset-y-0 left-1/2 w-full max-w-120 -translate-x-1/2 bg-[rgba(15,20,26,0.7)]'
      >
        <button
          type='button'
          onClick={close}
          aria-label='사진 보기 닫기'
          className='absolute inset-0'
        />

        <button
          type='button'
          onClick={close}
          aria-label='사진 보기 닫기'
          className='text-text-primary-inverse absolute top-5 left-4 z-10 flex size-10 items-center justify-center'
        >
          <Icon icon='Close' className='size-6' />
        </button>

        <div className='absolute top-[183px] left-4 h-[390px] w-[calc(100%-32px)] overflow-hidden'>
          <Image
            src={currentImage}
            alt={`유치원 사진 ${currentIndex + 1}`}
            fill
            sizes='358px'
            className='object-cover'
            priority
          />

          {images.length > 1 ? (
            <>
              <button
                type='button'
                onClick={handlePreviousClick}
                aria-label='이전 사진'
                className='text-text-primary-inverse absolute top-1/2 left-4 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(15,20,26,0.7)]'
              >
                <Icon icon='ChevronLeft' className='size-6' />
              </button>
              <button
                type='button'
                onClick={handleNextClick}
                aria-label='다음 사진'
                className='text-text-primary-inverse absolute top-1/2 right-4 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(15,20,26,0.7)]'
              >
                <Icon icon='ChevronRight' className='size-6' />
              </button>
            </>
          ) : null}

          <span className='caption1-semibold text-text-primary-inverse absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[rgba(15,20,26,0.7)] px-2 py-1'>
            {currentIndex + 1}/{images.length}
          </span>
        </div>

        <div className='scrollbar-hide absolute bottom-[env(safe-area-inset-bottom)] flex h-[100px] w-full items-center gap-2 overflow-x-auto px-4 py-5'>
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type='button'
              onClick={() => setCurrentIndex(index)}
              aria-label={`${index + 1}번째 사진 보기`}
              aria-current={currentIndex === index}
              className='relative size-[60px] shrink-0 overflow-hidden rounded-lg bg-background-50'
            >
              <Image src={image} alt='' fill sizes='60px' className='object-cover' />
            </button>
          ))}
        </div>
      </div>
    </RemoveScroll>
  );
}

export { OwnerKindergartenImageViewer };
export type { OwnerKindergartenImageViewerProps };
