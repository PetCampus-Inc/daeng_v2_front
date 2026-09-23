'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon, SwiperRoot, SwiperSlideItem } from '@knockdog/ui';
import { RemoveScroll } from 'react-remove-scroll';

import { guardianKindergartenNewsContent } from '@views/guardian-kindergarten-news-page/config/guardianKindergartenNewsContent';
import { ZoomableAlbumPhoto } from '@views/owner-album-page/ui/ZoomableAlbumPhoto';
import { useNativeBackToClose } from '@shared/lib/bridge';
import { useSaveImage } from '@shared/lib/media';
import { AlbumImage } from '@shared/ui/album-image';
import { toast } from '@shared/ui/toast';
import { Header } from '@widgets/Header';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface GuardianKindergartenNewsImageViewerProps {
  isOpen: boolean;
  close: () => void;
  imageUrls: string[];
  initialIndex?: number;
}

function showSaveSuccessToast() {
  const { imageViewer } = guardianKindergartenNewsContent;

  toast({
    type: 'success',
    nativeTitle: imageViewer.saveSuccessToast.nativeTitle,
    titleParts: [
      { text: '사진', accent: true },
      { text: '을 저장했어요' },
    ],
    title: (
      <>
        <span className='text-text-accent'>사진</span>
        <span className='text-text-primary-inverse'>을 저장했어요</span>
      </>
    ),
    duration: 3000,
  });
}

function showSaveFailedToast() {
  const { imageViewer } = guardianKindergartenNewsContent;

  toast({
    nativeTitle: imageViewer.saveFailedToast.nativeTitle,
    title: imageViewer.saveFailedToast.nativeTitle,
  });
}

/**
 * 보호자 소식 상세 첨부 이미지 뷰어 (원장과 동일)
 * - Close → 상세로 복귀 (오버레이라 스크롤 위치 유지)
 * - 좌우 스와이프(루프 없음), 핀치 줌, 하단 썸네일
 * - 저장 → OS 저장 + 토스트
 */
function GuardianKindergartenNewsImageViewer({
  isOpen,
  close,
  imageUrls,
  initialIndex = 0,
}: GuardianKindergartenNewsImageViewerProps) {
  const { detail, imageViewer } = guardianKindergartenNewsContent;
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isSaving, setIsSaving] = useState(false);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isSaveInFlightRef = useRef(false);
  const saveImage = useSaveImage();

  const currentUrl = imageUrls[activeIndex];
  const current = activeIndex + 1;
  const total = imageUrls.length;

  useNativeBackToClose(isOpen, close);

  useLayoutEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    firstFocusable?.focus();

    return () => {
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(Math.min(Math.max(initialIndex, 0), Math.max(imageUrls.length - 1, 0)));
  }, [imageUrls.length, initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (imageUrls.length === 0) {
      close();
      return;
    }
    setActiveIndex((prev) => Math.min(prev, imageUrls.length - 1));
  }, [close, imageUrls.length, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    thumbnailRefs.current[activeIndex]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        return;
      }

      if (event.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        return;
      }

      if (event.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : prev));
        return;
      }

      if (event.key !== 'Tab') return;

      const container = dialogRef.current;
      if (!container) return;

      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close, imageUrls.length, isOpen]);

  const handleSlideChange = useCallback((index: number) => {
    setActiveIndex((prev) => (prev === index ? prev : index));
  }, []);

  const handleThumbnailClick = useCallback((index: number) => {
    setActiveIndex((prev) => (prev === index ? prev : index));
  }, []);

  const handleSwipeEdge = useCallback(
    (direction: 'prev' | 'next') => {
      setActiveIndex((prev) => {
        if (direction === 'prev') return prev > 0 ? prev - 1 : prev;
        return prev < imageUrls.length - 1 ? prev + 1 : prev;
      });
    },
    [imageUrls.length]
  );

  const handleSaveClick = useCallback(async () => {
    if (!currentUrl || isSaveInFlightRef.current || isSaving) return;

    isSaveInFlightRef.current = true;
    setIsSaving(true);

    try {
      const saved = await saveImage({
        url: currentUrl,
        fileName: `kindergarten-news-${Date.now()}.jpg`,
      });

      if (saved) {
        showSaveSuccessToast();
        return;
      }

      showSaveFailedToast();
    } catch {
      showSaveFailedToast();
    } finally {
      isSaveInFlightRef.current = false;
      setIsSaving(false);
    }
  }, [currentUrl, isSaving, saveImage]);

  if (!isOpen || !currentUrl || imageUrls.length === 0) return null;

  return (
    <RemoveScroll forwardProps>
      <div
        ref={dialogRef}
        role='dialog'
        aria-modal='true'
        aria-label={detail.imageViewerAriaLabel}
        className='bg-bg-50 z-modal fixed inset-0 flex flex-col'
      >
        <div className='bg-bg-0 z-20 shrink-0 pt-(--safe-area-inset-top,0px)'>
          <Header>
            <Header.LeftSection>
              <Header.CloseButton onClick={close} aria-label={imageViewer.closeAriaLabel} />
            </Header.LeftSection>
            <Header.CenterSection>
              <p className='h3-extrabold'>
                <span className='text-text-accent'>{current}</span>
                <span className='text-text-primary'>{` / ${total}`}</span>
              </p>
            </Header.CenterSection>
            <Header.RightSection>
              <button
                type='button'
                onClick={() => {
                  void handleSaveClick();
                }}
                disabled={isSaving}
                aria-label={imageViewer.saveAriaLabel}
                className='inline-flex size-6 items-center justify-center disabled:opacity-50'
              >
                <Icon icon='Download' className='text-fill-secondary-700 size-6' />
              </button>
            </Header.RightSection>
          </Header>
        </div>

        <div className='bg-bg-50 relative min-h-0 flex-1 overflow-hidden'>
          <SwiperRoot
            className='absolute inset-0 h-full w-full [&>div]:h-full'
            loop={false}
            initialIndex={activeIndex}
            onSlideChange={handleSlideChange}
          >
            {imageUrls.map((url, index) => {
              const shouldMount = Math.abs(index - activeIndex) <= 1;

              return (
                <SwiperSlideItem key={`${url}-${index}`} className='h-full'>
                  {shouldMount ? (
                    <ZoomableAlbumPhoto
                      src={url}
                      isActive={index === activeIndex}
                      onSwipeEdge={handleSwipeEdge}
                      canSwipePrev={activeIndex > 0}
                      canSwipeNext={activeIndex < imageUrls.length - 1}
                    />
                  ) : (
                    <div className='bg-bg-50 h-full w-full' aria-hidden='true' />
                  )}
                </SwiperSlideItem>
              );
            })}
          </SwiperRoot>
        </div>

        <div className='bg-bg-0 z-20 shrink-0 pb-(--safe-area-inset-bottom,0px)'>
          <div className='scrollbar-hide flex justify-center gap-2 overflow-x-auto px-4 py-5'>
            {imageUrls.map((url, index) => {
              const isSelected = index === activeIndex;

              return (
                <button
                  key={`thumb-${url}-${index}`}
                  ref={(node) => {
                    thumbnailRefs.current[index] = node;
                  }}
                  type='button'
                  onClick={() => handleThumbnailClick(index)}
                  aria-label={detail.imageAriaLabel
                    .replace('{index}', String(index + 1))
                    .replace('{total}', String(total))}
                  aria-current={isSelected}
                  className={`bg-bg-50 radius-r2 relative size-[60px] shrink-0 overflow-hidden ${
                    isSelected ? 'border-line-accent border-2' : ''
                  }`}
                >
                  <AlbumImage
                    src={url}
                    className='absolute inset-0'
                    optimize
                    sizes='60px'
                    loading={Math.abs(index - activeIndex) <= 4 ? 'eager' : 'lazy'}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </RemoveScroll>
  );
}

export { GuardianKindergartenNewsImageViewer };
