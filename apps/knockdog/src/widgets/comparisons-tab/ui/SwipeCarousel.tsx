import { useRef, useState } from 'react';
import { IconButton } from '@knockdog/ui';
import { Slide, SlideProps } from './Slide';
import { Title } from './Title';

interface SwipeCarouselProps {
  title?: string;
  slides: SlideProps[];
}

function SwipeCarousel({ title, slides }: SwipeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = slides.length;
  const startX = useRef(0);
  const deltaX = useRef(0);
  const isDragging = useRef(false);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const clampIndex = (index: number) => Math.max(0, Math.min(count - 1, index));
  const goTo = (index: number) => setCurrentIndex(clampIndex(index));
  const prev = () => goTo(currentIndex - 1);
  const next = () => goTo(currentIndex + 1);

  const handlePointerDown = (event: React.PointerEvent) => {
    isDragging.current = true;
    startX.current = event.clientX;
    deltaX.current = 0;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: React.PointerEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    deltaX.current = event.clientX - startX.current;
    const percent = -currentIndex * 100 + (deltaX.current / trackRef.current.clientWidth) * 100;
    trackRef.current.style.transform = `translateX(${percent}%)`;
    trackRef.current.style.transition = 'none';
  };
  const handlePointerUp = () => {
    if (!isDragging.current || !trackRef.current) return;
    isDragging.current = false;
    const ratio = Math.abs(deltaX.current) / (trackRef.current.clientWidth || 1);
    let targetIndex = currentIndex;
    if (ratio > 0.2) targetIndex = deltaX.current < 0 ? currentIndex + 1 : currentIndex - 1;
    targetIndex = clampIndex(targetIndex);
    setCurrentIndex(targetIndex);
    trackRef.current.style.transition = 'transform 250ms ease';
    trackRef.current.style.transform = `translateX(${-targetIndex * 100}%)`;
  };

  return (
    <div className='w-full'>
      {title && <Title>{title}</Title>}
      <div
        className='relative overflow-hidden rounded-lg bg-white select-none'
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* 버튼 */}
        <IconButton
          aria-label='이전'
          icon='ChevronLeft'
          onClick={prev}
          disabled={currentIndex === 0}
          className='text-text-secondary absolute top-2 left-1 z-1 disabled:opacity-40'
        />
        <IconButton
          icon='ChevronRight'
          aria-label='다음'
          onClick={next}
          disabled={currentIndex === count - 1}
          className='text-text-secondary absolute top-2 right-1 z-1 disabled:opacity-40'
        />

        {/* 슬라이드 */}
        <div
          ref={trackRef}
          className='flex w-full touch-pan-y'
          style={{ transform: `translateX(${-currentIndex * 100}%)`, transition: 'transform 250ms ease' }}
        >
          {slides.map((slide, index) => (
            <Slide key={index} type={slide.type} rows={slide.rows} />
          ))}
        </div>

        {/* 인디케이터 */}
        <div className='mt-2 flex justify-center gap-2 p-2'>
          {Array.from({ length: count }).map((_, index) => (
            <span
              key={index}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${index === currentIndex ? 'bg-fill-secondary-700' : 'bg-fill-secondary-400'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export { SwipeCarousel };
