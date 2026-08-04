'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ActionButton, Icon, SwiperRoot, SwiperSlideItem } from '@knockdog/ui';
import { RemoveScroll } from 'react-remove-scroll';

import { ownerAlbumContent } from '@views/owner-album-page/config/ownerAlbumContent';
import {
  formatAlbumDetailTitle,
  formatAlbumUploadTime,
  getAlbumDayPosition,
} from '@views/owner-album-page/lib/groupAlbumPhotosByDate';
import type { OwnerAlbumPhoto } from '@views/owner-album-page/model/ownerAlbumPhoto';
import { ZoomableAlbumPhoto } from '@views/owner-album-page/ui/ZoomableAlbumPhoto';

import { Header } from '@widgets/Header';

import { useSaveImage } from '@shared/lib/media';
import { toast } from '@shared/ui/toast';

const PHOTO_ASPECT_CLASS = 'aspect-[358/287]';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface OwnerAlbumPhotoDetailProps {
  photos: OwnerAlbumPhoto[];
  initialIndex: number;
  onClose: () => void;
  onDelete: (photoId: string) => void;
}

function OwnerAlbumPhotoDetail({ photos, initialIndex, onClose, onDelete }: OwnerAlbumPhotoDetailProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isSaveInFlightRef = useRef(false);
  const saveImage = useSaveImage();

  const currentPhoto = photos[activeIndex];
  const dayPosition = getAlbumDayPosition(photos, activeIndex);

  useLayoutEffect(() => {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    firstFocusable?.focus();

    return () => {
      previousFocusRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    if (photos.length === 0) {
      onClose();
      return;
    }

    setActiveIndex((prev) => Math.min(prev, photos.length - 1));
  }, [onClose, photos.length]);

  useEffect(() => {
    thumbnailRefs.current[activeIndex]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isDeleteDialogOpen) {
          setIsDeleteDialogOpen(false);
          return;
        }
        onClose();
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
  }, [isDeleteDialogOpen, onClose]);

  const handleSlideChange = useCallback((index: number) => {
    setActiveIndex((prev) => (prev === index ? prev : index));
  }, []);

  const handleThumbnailClick = useCallback((index: number) => {
    setActiveIndex((prev) => (prev === index ? prev : index));
  }, []);

  /** 확대 중 좌/우 끝단 스와이프 → 이전·다음 (줌 리셋은 ZoomableAlbumPhoto isActive 변경으로 처리) */
  const handleSwipeEdge = useCallback(
    (direction: 'prev' | 'next') => {
      setActiveIndex((prev) => {
        if (direction === 'prev') return prev > 0 ? prev - 1 : prev;
        return prev < photos.length - 1 ? prev + 1 : prev;
      });
    },
    [photos.length]
  );

  const handleSaveClick = useCallback(async () => {
    if (!currentPhoto || isSaveInFlightRef.current || isSaving) return;

    isSaveInFlightRef.current = true;
    setIsSaving(true);

    try {
      const saved = await saveImage({
        url: currentPhoto.url,
        fileName: `album-${Date.now()}.jpg`,
      });

      if (saved) {
        toast({
          type: 'success',
          nativeTitle: ownerAlbumContent.detail.saveSuccessToast.nativeTitle,
          title: (
            <>
              <span className='text-text-accent'>사진</span>
              <span className='text-text-primary-inverse'>을 저장했어요</span>
            </>
          ),
          duration: 3000,
        });
        return;
      }

      toast({
        nativeTitle: ownerAlbumContent.detail.saveFailedToast.nativeTitle,
        title: ownerAlbumContent.detail.saveFailedToast.nativeTitle,
      });
    } catch {
      toast({
        nativeTitle: ownerAlbumContent.detail.saveFailedToast.nativeTitle,
        title: ownerAlbumContent.detail.saveFailedToast.nativeTitle,
      });
    } finally {
      isSaveInFlightRef.current = false;
      setIsSaving(false);
    }
  }, [currentPhoto, isSaving, saveImage]);

  const handleDeleteClick = useCallback(() => {
    if (!currentPhoto) return;
    setIsDeleteDialogOpen(true);
  }, [currentPhoto]);

  const handleDeleteConfirm = useCallback(() => {
    if (!currentPhoto) return;

    const photoId = currentPhoto.id;
    setIsDeleteDialogOpen(false);
    onDelete(photoId);
    toast({
      type: 'success',
      nativeTitle: ownerAlbumContent.detail.deleteSuccessToast.nativeTitle,
      title: (
        <>
          <span className='text-text-accent'>사진</span>
          <span className='text-text-primary-inverse'>을 삭제했어요</span>
        </>
      ),
      duration: 3000,
    });
  }, [currentPhoto, onDelete]);

  if (!currentPhoto || photos.length === 0) return null;

  return (
    <RemoveScroll forwardProps>
      <div
        ref={dialogRef}
        role='dialog'
        aria-modal='true'
        aria-label={formatAlbumDetailTitle(new Date(currentPhoto.uploadedAt))}
        className='bg-bg-50 z-modal fixed inset-0 flex flex-col'
      >
        <div className='bg-bg-0 z-20 shrink-0 pt-(--safe-area-inset-top,0px)'>
          <Header>
            <Header.LeftSection>
              <Header.BackButton onClick={onClose} />
            </Header.LeftSection>
            <Header.Title>{formatAlbumDetailTitle(new Date(currentPhoto.uploadedAt))}</Header.Title>
            <Header.RightSection>
              <button
                type='button'
                onClick={handleDeleteClick}
                className='inline-flex size-6 items-center justify-center'
                aria-label={ownerAlbumContent.detail.deleteAriaLabel}
              >
                <Icon icon='Trash' className='text-fill-secondary-700 size-6' />
              </button>
            </Header.RightSection>
          </Header>

          <div className='bg-bg-0 flex items-center justify-between p-4'>
            <div className='flex items-center gap-1'>
              <Icon icon='Time' className='text-fill-secondary-500 relative size-4.5' />
              <span className='body2-regular text-text-secondary'>
                {formatAlbumUploadTime(new Date(currentPhoto.uploadedAt))}
              </span>
            </div>
            <button
              type='button'
              onClick={handleSaveClick}
              disabled={isSaving}
              className='radius-r2 border-line-400 caption2-semibold text-text-secondary inline-flex min-w-[97px] items-center justify-center gap-1 border bg-white px-4 py-2 disabled:opacity-50'
            >
              {ownerAlbumContent.detail.saveLabel}
              <Icon icon='Download' className='size-3.5' />
            </button>
          </div>
        </div>

        <div className='bg-bg-50 relative min-h-0 flex-1 overflow-hidden'>
          <SwiperRoot
            className='absolute inset-0 h-full w-full [&>div]:h-full'
            loop={false}
            initialIndex={activeIndex}
            onSlideChange={handleSlideChange}
          >
            {photos.map((photo, index) => (
              <SwiperSlideItem key={photo.id} className='h-full'>
                <ZoomableAlbumPhoto
                  src={photo.url}
                  isActive={index === activeIndex}
                  photoAspectClassName={PHOTO_ASPECT_CLASS}
                  onSwipeEdge={handleSwipeEdge}
                  canSwipePrev={activeIndex > 0}
                  canSwipeNext={activeIndex < photos.length - 1}
                />
              </SwiperSlideItem>
            ))}
          </SwiperRoot>

          {dayPosition.total > 0 ? (
            <span className='caption1-semibold text-text-primary-inverse bg-dim-70 absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full px-2 py-1'>
              {dayPosition.current}/{dayPosition.total}
            </span>
          ) : null}
        </div>

        <div className='bg-bg-0 z-20 shrink-0 pb-(--safe-area-inset-bottom,0px)'>
          <div className='scrollbar-hide flex gap-2 overflow-x-auto px-4 py-5'>
            {photos.map((photo, index) => {
              const isSelected = index === activeIndex;

              return (
                <button
                  key={photo.id}
                  ref={(node) => {
                    thumbnailRefs.current[index] = node;
                  }}
                  type='button'
                  onClick={() => handleThumbnailClick(index)}
                  aria-label={`${index + 1}번째 사진 보기`}
                  aria-current={isSelected}
                  className={`bg-bg-50 radius-r2 relative size-[60px] shrink-0 overflow-hidden ${
                    isSelected ? 'border-line-accent border-2' : ''
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- S3 pre-signed URL 임시 미리보기 */}
                  <img src={photo.url} alt='' className='radius-r2 h-full w-full object-cover' />
                </button>
              );
            })}
          </div>
        </div>

        {isDeleteDialogOpen ? (
          <div className='absolute inset-0 z-50 flex items-center justify-center'>
            <div
              className='bg-dim-70 absolute inset-0'
              aria-hidden='true'
              onClick={() => setIsDeleteDialogOpen(false)}
            />
            <div
              role='alertdialog'
              aria-modal='true'
              aria-labelledby='owner-album-delete-dialog-title'
              className='bg-bg-0 radius-r3 relative z-10 grid w-full max-w-[334px] shadow-lg'
            >
              <div className='pt-x7 px-x5 gap-x2 flex flex-col text-center'>
                <h2 id='owner-album-delete-dialog-title' className='h2-extrabold text-text-primary'>
                  {ownerAlbumContent.detail.deleteDialogTitle}
                </h2>
              </div>
              <div className='px-x5 pb-x7 pt-x6 gap-x2 flex flex-row items-center'>
                <ActionButton
                  type='button'
                  variant='secondaryLine'
                  size='large'
                  className='flex-1'
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  {ownerAlbumContent.detail.deleteDialogCloseLabel}
                </ActionButton>
                <ActionButton
                  type='button'
                  variant='primaryFill'
                  size='large'
                  className='flex-1'
                  onClick={handleDeleteConfirm}
                >
                  {ownerAlbumContent.detail.deleteDialogConfirmLabel}
                </ActionButton>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </RemoveScroll>
  );
}

export { OwnerAlbumPhotoDetail };
