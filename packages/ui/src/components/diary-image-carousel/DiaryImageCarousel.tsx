'use client';

import { useRef, useState, type PointerEvent, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

const DIARY_IMAGE_SWIPE_PX = 40;

interface DiaryImageCarouselProps {
  images?: ReactNode[];
  value?: number;
  defaultValue?: number;
  className?: string;
  onValueChange?: (index: number) => void;
}

function holdDiaryImagePointer(event: PointerEvent<HTMLDivElement>) {
  const target = event.currentTarget;
  if (typeof target.setPointerCapture !== 'function') return;
  try {
    target.setPointerCapture(event.pointerId);
  } catch {
    return;
  }
}

/** V4 / Dog Diary / Image Carousel */
function DiaryImageCarousel({ images = [], value, defaultValue = 0, className, onValueChange }: DiaryImageCarouselProps) {
  const [innerIndex, setInnerIndex] = useState(defaultValue);
  const selected = value ?? innerIndex;
  const startX = useRef<number | null>(null);

  function selectIndex(nextIndex: number) {
    if (images.length === 0) return;
    const clamped = Math.max(0, Math.min(images.length - 1, nextIndex));
    setInnerIndex(clamped);
    onValueChange?.(clamped);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (images.length < 2) return;
    startX.current = event.clientX;
    holdDiaryImagePointer(event);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (startX.current == null) return;
    const delta = event.clientX - startX.current;
    startX.current = null;
    if (delta <= -DIARY_IMAGE_SWIPE_PX) selectIndex(selected + 1);
    if (delta >= DIARY_IMAGE_SWIPE_PX) selectIndex(selected - 1);
  }

  function handlePointerCancel() {
    startX.current = null;
  }

  return (
    <div className={cn('gap-x2 flex w-full min-w-0 max-w-[450px] flex-col', className)}>
      <div
        className='bg-fill-secondary-100 radius-r3 aspect-square w-full min-w-0 touch-pan-y overflow-hidden select-none [&_img]:pointer-events-none [&_img]:size-full [&_img]:max-w-full [&_img]:object-cover'
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onDragStart={(event) => event.preventDefault()}
      >
        <div className='flex h-full w-full' style={{ transform: `translateX(-${selected * 100}%)` }}>
          {images.map((image, index) => (
            <div key={index} className='h-full w-full min-w-0 shrink-0'>
              {image}
            </div>
          ))}
        </div>
      </div>
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
