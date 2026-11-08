'use client';

import { useState, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

interface DiaryImageCarouselProps {
  images?: ReactNode[];
  value?: number;
  defaultValue?: number;
  className?: string;
  onValueChange?: (index: number) => void;
}

/** V4 / Dog Diary / Image Carousel */
function DiaryImageCarousel({ images = [], value, defaultValue = 0, className, onValueChange }: DiaryImageCarouselProps) {
  const [innerIndex, setInnerIndex] = useState(defaultValue);
  const selected = value ?? innerIndex;

  function selectIndex(nextIndex: number) {
    setInnerIndex(nextIndex);
    onValueChange?.(nextIndex);
  }

  return (
    <div className={cn('gap-x2 flex w-[358px] flex-col', className)}>
      <div className='bg-fill-secondary-100 radius-r3 size-[358px] overflow-hidden'>{images[selected]}</div>
      <div className='gap-x1_5 py-x1 flex h-[14px] w-full items-center justify-center'>
        {images.map((_, index) => (
          <button
            key={index}
            type='button'
            aria-label={`${index + 1}번째 사진`}
            aria-current={index === selected}
            onClick={() => selectIndex(index)}
            className={cn('rounded-full', index === selected ? 'bg-fill-secondary-800 h-[6px] w-[18px]' : 'bg-primitive-neutral-300 size-[6px]')}
          />
        ))}
      </div>
    </div>
  );
}

export { DiaryImageCarousel };
export type { DiaryImageCarouselProps };
