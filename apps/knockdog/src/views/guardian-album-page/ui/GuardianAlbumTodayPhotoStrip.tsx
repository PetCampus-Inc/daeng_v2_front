'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import type { GuardianAlbumPhoto } from '@views/guardian-album-page/config/guardianAlbumTodayMock';

import { GuardianAlbumTodayPhotoCard } from './GuardianAlbumTodayPhotoCard';

interface GuardianAlbumTodayPhotoStripProps {
  photos: GuardianAlbumPhoto[];
  totalPhotoCount: number;
  lastViewedAt: number;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (photoId: string) => void;
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
      {/* eslint-disable-next-line @next/next/no-img-element -- mock/S3 앨범 썸네일 */}
      <img src={url} alt='' className='size-full object-cover' loading='lazy' decoding='async' />
      <div className='bg-dim-70 absolute inset-0 flex items-center justify-center rounded-lg'>
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
}: GuardianAlbumTodayPhotoStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ widthRatio: 1, leftRatio: 0 });
  const remainingCount = totalPhotoCount - photos.length;
  const overflowPhoto = remainingCount > 0 ? photos[photos.length - 1] : null;

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
            />
          );
        })}
        {overflowPhoto ? (
          <GuardianAlbumTodayOverflowCard url={overflowPhoto.url} remainingCount={remainingCount} />
        ) : null}
        <div className='w-4 shrink-0' aria-hidden />
      </div>

      <div className='px-4'>
        <div className='bg-bg-50 relative h-2.5 w-full rounded p-0.5'>
          <div
            className='bg-fill-primary-500 absolute top-0.5 h-1.5 rounded-full'
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
