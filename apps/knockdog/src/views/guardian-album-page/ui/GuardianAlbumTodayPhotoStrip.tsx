'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

import { AlbumImage } from '@shared/ui/album-image';
import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import type { GuardianAlbumPhoto } from '@views/guardian-album-page/config/guardianAlbumTodayMock';

import { GuardianAlbumTodayPhotoCard } from './GuardianAlbumTodayPhotoCard';

interface GuardianAlbumTodayPhotoStripProps {
  photos: GuardianAlbumPhoto[];
  totalPhotoCount: number;
  lastViewedAt: number;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (photoId: string) => void;
  onPhotoClick?: (photoId: string) => void;
  onOverflowClick?: () => void;
}

function GuardianAlbumTodayOverflowCard({
  url,
  remainingCount,
}: {
  url: string;
  remainingCount: number;
}) {
  const { today } = guardianAlbumContent;

  return (
    <div className='relative size-[150px] shrink-0 overflow-hidden rounded-lg'>
      <AlbumImage src={url} className='absolute inset-0' />
      <div className='bg-dim-70 absolute inset-0 z-10 flex items-center justify-center rounded-lg'>
        <span className='text-text-primary-inverse text-[18px] leading-[26px] font-medium tracking-[-0.36px]'>
          {today.overflowLabel(remainingCount)}
        </span>
      </div>
    </div>
  );
}

function GuardianAlbumTodayPhotoStrip({
  photos,
  totalPhotoCount,
  lastViewedAt,
  bookmarkedIds,
  onToggleBookmark,
  onPhotoClick,
  onOverflowClick,
}: GuardianAlbumTodayPhotoStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef(0);
  const [thumb, setThumb] = useState({ widthRatio: 1, leftRatio: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const remainingCount = totalPhotoCount - photos.length;
  const overflowPhoto = remainingCount > 0 ? photos[photos.length - 1] : null;
  const canScroll = thumb.widthRatio < 1;

  const updateThumb = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;

    const { scrollLeft, scrollWidth, clientWidth } = node;
    if (scrollWidth <= clientWidth) {
      setThumb({ widthRatio: 1, leftRatio: 0 });
      return;
    }

    const widthRatio = clientWidth / scrollWidth;
    const maxLeft = 1 - widthRatio;
    const leftRatio = maxLeft <= 0 ? 0 : (scrollLeft / (scrollWidth - clientWidth)) * maxLeft;
    setThumb({ widthRatio, leftRatio });
  }, []);

  const scrollToThumbLeftRatio = useCallback((nextLeftRatio: number) => {
    const node = scrollRef.current;
    if (!node) return;

    const { scrollWidth, clientWidth } = node;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;

    const widthRatio = clientWidth / scrollWidth;
    const maxLeft = 1 - widthRatio;
    if (maxLeft <= 0) return;

    const clampedLeft = Math.min(Math.max(nextLeftRatio, 0), maxLeft);
    node.scrollLeft = (clampedLeft / maxLeft) * maxScroll;
  }, []);

  const getThumbLeftRatioFromClientX = useCallback((clientX: number, thumbWidthRatio: number) => {
    const track = trackRef.current;
    if (!track) return 0;

    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return 0;

    const thumbWidthPx = thumbWidthRatio * rect.width;
    const maxThumbLeftPx = Math.max(rect.width - thumbWidthPx, 0);
    const pointerLeftPx = clientX - rect.left - dragOffsetRef.current;
    const clampedLeftPx = Math.min(Math.max(pointerLeftPx, 0), maxThumbLeftPx);

    return maxThumbLeftPx <= 0 ? 0 : clampedLeftPx / rect.width;
  }, []);

  useEffect(() => {
    updateThumb();
    const node = scrollRef.current;
    if (!node) return;

    const handleResize = () => updateThumb();
    node.addEventListener('scroll', updateThumb, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      node.removeEventListener('scroll', updateThumb);
      window.removeEventListener('resize', handleResize);
    };
  }, [photos.length, remainingCount, updateThumb]);

  const handleTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canScroll) return;

    const track = trackRef.current;
    if (!track) return;

    event.preventDefault();
    track.setPointerCapture(event.pointerId);
    setIsDragging(true);

    const rect = track.getBoundingClientRect();
    const thumbWidthPx = thumb.widthRatio * rect.width;
    const thumbLeftPx = thumb.leftRatio * rect.width;
    const pointerX = event.clientX - rect.left;
    const isOnThumb = pointerX >= thumbLeftPx && pointerX <= thumbLeftPx + thumbWidthPx;

    // 썸 밖 클릭: 포인터 중심으로 점프 / 썸 위: 잡은 위치 유지하며 드래그
    dragOffsetRef.current = isOnThumb ? pointerX - thumbLeftPx : thumbWidthPx / 2;

    scrollToThumbLeftRatio(getThumbLeftRatioFromClientX(event.clientX, thumb.widthRatio));
  };

  const handleTrackPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || !canScroll) return;
    scrollToThumbLeftRatio(getThumbLeftRatioFromClientX(event.clientX, thumb.widthRatio));
  };

  const handleTrackPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const track = trackRef.current;
    if (track?.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  };

  return (
    <div className='flex w-full flex-col gap-2'>
      <div ref={scrollRef} className='scrollbar-hide flex gap-1 overflow-x-auto pl-4'>
        {photos.map((photo) => {
          const uploadedAt = new Date(photo.uploadedAt).getTime();
          const isNew = Number.isFinite(uploadedAt) && uploadedAt > lastViewedAt;

          return (
            <GuardianAlbumTodayPhotoCard
              key={photo.id}
              url={photo.url}
              isNew={isNew}
              isBookmarked={bookmarkedIds.has(photo.id)}
              onToggleBookmark={() => onToggleBookmark(photo.id)}
              onClick={() => onPhotoClick?.(photo.id)}
            />
          );
        })}
        {overflowPhoto ? (
          <button type='button' className='shrink-0' onClick={onOverflowClick}>
            <GuardianAlbumTodayOverflowCard url={overflowPhoto.url} remainingCount={remainingCount} />
          </button>
        ) : null}
        <div className='w-4 shrink-0' aria-hidden />
      </div>

      <div className='px-4'>
        <div
          ref={trackRef}
          role='scrollbar'
          aria-orientation='horizontal'
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round((thumb.leftRatio / Math.max(1 - thumb.widthRatio, 0.0001)) * 100)}
          aria-label='오늘 사진 목록 스크롤'
          tabIndex={canScroll ? 0 : -1}
          className={`bg-bg-50 relative h-2.5 w-full touch-none rounded p-0.5 ${
            canScroll ? 'cursor-pointer' : ''
          }`}
          onPointerDown={handleTrackPointerDown}
          onPointerMove={handleTrackPointerMove}
          onPointerUp={handleTrackPointerUp}
          onPointerCancel={handleTrackPointerUp}
        >
          <div
            className={`bg-fill-primary-500 absolute top-0.5 h-1.5 rounded-full ${
              isDragging ? '' : 'transition-[left,width] duration-75'
            }`}
            style={{
              width: `${thumb.widthRatio * 100}%`,
              left: `${thumb.leftRatio * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export { GuardianAlbumTodayPhotoStrip };
