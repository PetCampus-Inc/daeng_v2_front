'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon, SwiperRoot, SwiperSlideItem } from '@knockdog/ui';
import { RemoveScroll } from 'react-remove-scroll';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import type { GuardianAlbumPhoto } from '@views/guardian-album-page/config/guardianAlbumTodayMock';
import { isGuardianAlbumExpandPhotoId } from '@views/guardian-album-page/lib/guardianAlbumPhotoId';
import { GuardianAlbumPhotoGrid } from '@views/guardian-album-page/ui/GuardianAlbumPhotoGrid';
import {
  formatAlbumDetailTitle,
  formatAlbumUploadTime,
} from '@views/owner-album-page/lib/groupAlbumPhotosByDate';
import { ZoomableAlbumPhoto } from '@views/owner-album-page/ui/ZoomableAlbumPhoto';
import { Header } from '@widgets/Header';
import { useShare } from '@shared/lib/device/useShare';
import { useSaveImage } from '@shared/lib/media';
import { toast } from '@shared/ui/toast';

const PHOTO_ASPECT_CLASS = 'aspect-[358/287]';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function resolveBookmarkPhotoId(photoId: string) {
  const expandIndex = photoId.indexOf('-expand-');
  return expandIndex >= 0 ? photoId.slice(0, expandIndex) : photoId;
}

interface GuardianAlbumPhotoDetailProps {
  photos: GuardianAlbumPhoto[];
  initialIndex: number;
  onClose: () => void;
  /** 유치원 메인 바로가기 진입 시에만 true — 리스트 이동 아이콘 노출 */
  showListButton?: boolean;
  onListClick?: () => void;
  onToggleFavorite?: (photoId: string, isFavorite: boolean) => Promise<void>;
}

function GuardianAlbumPhotoDetail({
  photos,
  initialIndex,
  onClose,
  showListButton = false,
  onListClick,
  onToggleFavorite,
}: GuardianAlbumPhotoDetailProps) {
  const { detail } = guardianAlbumContent;
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [failedPhotoIds, setFailedPhotoIds] = useState<Set<string>>(() => {
    return new Set(photos.filter((photo) => photo.hasLoadError).map((photo) => photo.id));
  });
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    return new Set(photos.filter((photo) => photo.isBookmarked).map((photo) => photo.id));
  });
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isSaveInFlightRef = useRef(false);
  const saveImage = useSaveImage();
  const share = useShare();

  const currentPhoto = photos[activeIndex];
  const current = activeIndex + 1;
  const total = photos.length;
  const isBookmarked = currentPhoto
    ? bookmarkedIds.has(resolveBookmarkPhotoId(currentPhoto.id))
    : false;
  const canToggleFavorite =
    currentPhoto != null && !isGuardianAlbumExpandPhotoId(currentPhoto.id);
  const isCurrentLoadError = currentPhoto
    ? currentPhoto.hasLoadError === true || failedPhotoIds.has(currentPhoto.id)
    : false;

  const handlePhotoLoadError = useCallback((photoId: string) => {
    setFailedPhotoIds((prev) => {
      if (prev.has(photoId)) return prev;
      const next = new Set(prev);
      next.add(photoId);
      return next;
    });
  }, []);

  const isPhotoLoadError = useCallback(
    (photo: GuardianAlbumPhoto) => photo.hasLoadError === true || failedPhotoIds.has(photo.id),
    [failedPhotoIds]
  );

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
    setBookmarkedIds(
      new Set(photos.filter((photo) => photo.isBookmarked).map((photo) => photo.id))
    );
  }, [photos]);

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
        if (isGridOpen) {
          setIsGridOpen(false);
          return;
        }
        onClose();
        return;
      }
      if (event.key !== 'Tab' || isGridOpen) return;

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
  }, [isGridOpen, onClose]);

  const handleSlideChange = useCallback((index: number) => {
    setActiveIndex((prev) => (prev === index ? prev : index));
  }, []);

  const handleThumbnailClick = useCallback((index: number) => {
    setActiveIndex((prev) => (prev === index ? prev : index));
  }, []);

  const handleOpenGrid = useCallback(() => {
    setIsGridOpen(true);
  }, []);

  const handleCloseGrid = useCallback(() => {
    setIsGridOpen(false);
  }, []);

  const handleGridPhotoClick = useCallback((index: number) => {
    setActiveIndex(index);
    setIsGridOpen(false);
  }, []);

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
    if (!currentPhoto || isCurrentLoadError || isSaveInFlightRef.current || isSaving) return;

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
          nativeTitle: detail.saveSuccessToast.nativeTitle,
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
        return;
      }

      toast({
        nativeTitle: detail.saveFailedToast.nativeTitle,
        title: detail.saveFailedToast.nativeTitle,
      });
    } catch {
      toast({
        nativeTitle: detail.saveFailedToast.nativeTitle,
        title: detail.saveFailedToast.nativeTitle,
      });
    } finally {
      isSaveInFlightRef.current = false;
      setIsSaving(false);
    }
  }, [currentPhoto, detail.saveFailedToast.nativeTitle, detail.saveSuccessToast.nativeTitle, isCurrentLoadError, isSaving, saveImage]);

  const handleShareClick = useCallback(async () => {
    if (!currentPhoto || isCurrentLoadError) return;

    // 상대경로 mock/이미지 URL도 OS 공유 시트에 절대경로로 전달
    const shareUrl =
      typeof window !== 'undefined'
        ? new URL(currentPhoto.url, window.location.origin).href
        : currentPhoto.url;

    await share({
      title: '앨범 사진',
      message: shareUrl,
      url: shareUrl,
    });
  }, [currentPhoto, isCurrentLoadError, share]);

  const handleFavoriteClick = useCallback(() => {
    if (!currentPhoto || !canToggleFavorite) return;

    const photoId = resolveBookmarkPhotoId(currentPhoto.id);
    const nextIsFavorite = !bookmarkedIds.has(photoId);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (nextIsFavorite) next.add(photoId);
      else next.delete(photoId);
      return next;
    });

    void onToggleFavorite?.(photoId, nextIsFavorite).catch(() => {
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (nextIsFavorite) next.delete(photoId);
        else next.add(photoId);
        return next;
      });
    });
  }, [bookmarkedIds, canToggleFavorite, currentPhoto, onToggleFavorite]);

  if (!currentPhoto || photos.length === 0) return null;

  const uploadedAt = new Date(currentPhoto.uploadedAt);

  return (
    <>
      <RemoveScroll forwardProps>
        <div
          ref={dialogRef}
          role='dialog'
          aria-modal='true'
          aria-label={formatAlbumDetailTitle(uploadedAt)}
          className='bg-bg-50 z-modal fixed inset-0 flex flex-col'
        >
        <div className='bg-bg-0 z-20 shrink-0 pt-(--safe-area-inset-top,0px)'>
          <Header>
            <Header.LeftSection>
              <Header.BackButton onClick={onClose} />
            </Header.LeftSection>
            <Header.Title>{formatAlbumDetailTitle(uploadedAt)}</Header.Title>
            {showListButton ? (
              <Header.RightSection>
                <button
                  type='button'
                  onClick={onListClick ?? onClose}
                  className='inline-flex size-6 items-center justify-center'
                  aria-label={detail.listAriaLabel}
                >
                  <Icon icon='List' className='text-fill-secondary-700 size-6' />
                </button>
              </Header.RightSection>
            ) : null}
          </Header>

          <div className='bg-bg-0 flex items-center justify-between p-4'>
            <div className='gap-x1 flex items-center'>
              <Icon icon='Time' className='text-fill-secondary-500 size-4' />
              <span className='body2-semibold text-text-primary'>
                {formatAlbumUploadTime(uploadedAt)}
              </span>
            </div>
            <div className='body2-semibold flex items-center gap-0.5'>
              <span className='text-text-accent'>{current}</span>
              <span className='text-text-primary'>/ {total}</span>
            </div>
          </div>
        </div>

        <div className='bg-bg-50 relative min-h-0 flex-1 overflow-hidden'>
          <SwiperRoot
            className='absolute inset-0 h-full w-full [&>div]:h-full'
            loop={false}
            initialIndex={activeIndex}
            onSlideChange={handleSlideChange}
          >
            {photos.map((photo, index) => {
              const hasError = isPhotoLoadError(photo);

              return (
                <SwiperSlideItem key={photo.id} className='h-full'>
                  {hasError ? (
                    <div className='bg-bg-50 flex h-full w-full items-center justify-center px-4'>
                      <p className='body1-medium text-text-tertiary text-center'>
                        {detail.loadErrorMessage}
                      </p>
                    </div>
                  ) : (
                    <ZoomableAlbumPhoto
                      src={photo.url}
                      isActive={index === activeIndex}
                      photoAspectClassName={PHOTO_ASPECT_CLASS}
                      onSwipeEdge={handleSwipeEdge}
                      canSwipePrev={activeIndex > 0}
                      canSwipeNext={activeIndex < photos.length - 1}
                      onLoadError={() => handlePhotoLoadError(photo.id)}
                    />
                  )}
                </SwiperSlideItem>
              );
            })}
          </SwiperRoot>

          <div className='pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center'>
            <div className='pointer-events-auto bg-bg-0 flex items-center gap-4 rounded-full px-6 py-4'>
              <button
                type='button'
                className='inline-flex size-6 items-center justify-center'
                aria-label={detail.gridAriaLabel}
                onClick={handleOpenGrid}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- 디자인 제공 PNG 아이콘 */}
                <img
                  src={detail.gridIconSrc}
                  alt=''
                  width={24}
                  height={24}
                  className='size-6'
                  draggable={false}
                />
              </button>
              <span className='bg-line-200 h-3.5 w-px shrink-0' aria-hidden='true' />
              <button
                type='button'
                className='inline-flex size-6 items-center justify-center disabled:opacity-50'
                aria-label={detail.saveAriaLabel}
                disabled={isSaving || isCurrentLoadError}
                onClick={handleSaveClick}
              >
                <Icon icon='Download' className='text-fill-secondary-700 size-6' />
              </button>
              <span className='bg-line-200 h-3.5 w-px shrink-0' aria-hidden='true' />
              <button
                type='button'
                className='inline-flex size-6 items-center justify-center disabled:opacity-50'
                aria-label={detail.shareAriaLabel}
                disabled={isCurrentLoadError}
                onClick={handleShareClick}
              >
                <Icon icon='Share' className='text-fill-secondary-700 size-6' />
              </button>
              <span className='bg-line-200 h-3.5 w-px shrink-0' aria-hidden='true' />
              <button
                type='button'
                className='inline-flex size-6 items-center justify-center disabled:opacity-50'
                aria-label={detail.favoriteAriaLabel}
                aria-pressed={isBookmarked}
                disabled={!canToggleFavorite}
                onClick={handleFavoriteClick}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- 디자인 제공 PNG 아이콘 */}
                <img
                  src={isBookmarked ? detail.favoriteIconActiveSrc : detail.favoriteIconDefaultSrc}
                  alt=''
                  width={24}
                  height={24}
                  className='size-6'
                  draggable={false}
                />
              </button>
            </div>
          </div>
        </div>

        <div className='bg-bg-0 z-20 shrink-0 pb-(--safe-area-inset-bottom,0px)'>
          <div className='scrollbar-hide flex gap-2 overflow-x-auto px-4 py-5'>
            {photos.map((photo, index) => {
              const isSelected = index === activeIndex;
              const hasError = isPhotoLoadError(photo);

              return (
                <button
                  key={photo.id}
                  ref={(node) => {
                    thumbnailRefs.current[index] = node;
                  }}
                  type='button'
                  onClick={() => handleThumbnailClick(index)}
                  aria-label={detail.thumbnailAriaLabel(index)}
                  aria-current={isSelected}
                  className={`bg-bg-50 radius-r2 relative size-[60px] shrink-0 overflow-hidden ${
                    isSelected ? 'border-line-accent border-2' : ''
                  }`}
                >
                  {hasError ? (
                    <div className='bg-fill-secondary-200 radius-r2 absolute inset-0' />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- mock/S3 앨범 썸네일
                    <img src={photo.url} alt='' className='radius-r2 h-full w-full object-cover' />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      </RemoveScroll>

      {isGridOpen ? (
        <GuardianAlbumPhotoGrid
          photos={photos}
          title={formatAlbumDetailTitle(uploadedAt)}
          failedPhotoIds={failedPhotoIds}
          onClose={handleCloseGrid}
          onPhotoClick={handleGridPhotoClick}
        />
      ) : null}
    </>
  );
}

export { GuardianAlbumPhotoDetail };
