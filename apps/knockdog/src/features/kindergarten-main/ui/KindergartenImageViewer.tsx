'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SwiperRoot, SwiperSlideItem } from '@knockdog/ui';
import { RemoveScroll } from 'react-remove-scroll';

import { ZoomableAlbumPhoto } from '@views/owner-album-page/ui/ZoomableAlbumPhoto';
import { Header } from '@widgets/Header';
import { AlbumImage } from '@shared/ui/album-image';

interface KindergartenImageViewerProps {
  isOpen: boolean;
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

/** 원장 앨범 사진 상세와 같은 탐색 UI를 사용하는 유치원 이미지 뷰어 */
export function KindergartenImageViewer({ isOpen, images, initialIndex, onClose }: KindergartenImageViewerProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [swiperInitialIndex, setSwiperInitialIndex] = useState(initialIndex);
  const [swiperSelectionVersion, setSwiperSelectionVersion] = useState(0);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveIndex(initialIndex);
    setSwiperInitialIndex(initialIndex);
    setSwiperSelectionVersion((version) => version + 1);
  }, [initialIndex]);

  useEffect(() => {
    if (!isOpen || images.length === 0) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (!firstElement || !lastElement) return;

      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === firstElement || !dialogRef.current?.contains(activeElement))) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && (activeElement === lastElement || !dialogRef.current?.contains(activeElement))) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [images.length, isOpen, onClose]);

  useEffect(() => {
    thumbnailRefs.current[activeIndex]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeIndex]);

  const handleSwipeEdge = useCallback(
    (direction: 'prev' | 'next') => {
      setActiveIndex((previous) => {
        if (direction === 'prev') return previous > 0 ? previous - 1 : previous;
        return previous < images.length - 1 ? previous + 1 : previous;
      });
    },
    [images.length]
  );

  if (!isOpen || images.length === 0) return null;

  return (
    <RemoveScroll forwardProps>
      <div
        ref={dialogRef}
        tabIndex={-1}
        data-kindergarten-image-viewer
        role='dialog'
        aria-modal='true'
        aria-label='유치원 사진 보기'
        className='bg-bg-50 z-modal fixed inset-0 flex flex-col'
      >
        <div className='bg-bg-0 z-20 shrink-0 pt-(--safe-area-inset-top,0px)'>
          <Header>
            <Header.LeftSection>
              <Header.CloseButton
                onClick={(event) => {
                  event.stopPropagation();
                  onClose();
                }}
              />
            </Header.LeftSection>
            <Header.Title>
              <span className='text-text-accent'>{activeIndex + 1}</span> / {images.length}
            </Header.Title>
          </Header>
        </div>

        <div className='bg-bg-50 relative min-h-0 flex-1 overflow-hidden'>
          <SwiperRoot
            key={`${images.length}-${swiperInitialIndex}-${swiperSelectionVersion}`}
            className='absolute inset-0 h-full w-full [&>div]:h-full'
            loop={false}
            initialIndex={swiperInitialIndex}
            onSlideChange={setActiveIndex}
          >
            {images.map((image, index) => (
              <SwiperSlideItem key={`${image}-${index}`} className='h-full'>
                {Math.abs(index - activeIndex) <= 1 ? (
                  <ZoomableAlbumPhoto
                    src={image}
                    isActive={index === activeIndex}
                    onSwipeEdge={handleSwipeEdge}
                    canSwipePrev={activeIndex > 0}
                    canSwipeNext={activeIndex < images.length - 1}
                  />
                ) : (
                  <div className='bg-bg-50 h-full w-full' aria-hidden='true' />
                )}
              </SwiperSlideItem>
            ))}
          </SwiperRoot>
        </div>

        <div className='bg-bg-0 z-20 shrink-0 pb-(--safe-area-inset-bottom,0px)'>
          <div className='scrollbar-hide flex gap-2 overflow-x-auto px-4 py-5'>
            {images.map((image, index) => {
              const isSelected = index === activeIndex;
              return (
                <button
                  key={`${image}-${index}`}
                  ref={(node) => {
                    thumbnailRefs.current[index] = node;
                  }}
                  type='button'
                  onClick={() => {
                    setActiveIndex(index);
                    setSwiperInitialIndex(index);
                    setSwiperSelectionVersion((version) => version + 1);
                  }}
                  aria-label={`${index + 1}번째 사진 보기`}
                  aria-current={isSelected}
                  className={`bg-bg-50 radius-r2 relative size-[60px] shrink-0 overflow-hidden ${
                    isSelected ? 'border-line-accent border-2' : ''
                  }`}
                >
                  <AlbumImage src={image} className='absolute inset-0' optimize sizes='60px' />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </RemoveScroll>
  );
}
