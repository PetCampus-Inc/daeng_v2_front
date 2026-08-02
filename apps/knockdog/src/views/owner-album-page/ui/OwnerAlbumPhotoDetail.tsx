'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon, SwiperRoot, SwiperSlideItem } from '@knockdog/ui';
import { RemoveScroll } from 'react-remove-scroll';

import { ownerAlbumContent } from '@views/owner-album-page/config/ownerAlbumContent';
import {
  formatAlbumDetailTitle,
  formatAlbumUploadTime,
  getAlbumDayPosition,
} from '@views/owner-album-page/lib/groupAlbumPhotosByDate';
import type { OwnerAlbumPhoto } from '@views/owner-album-page/model/ownerAlbumPhoto';

import { Header } from '@widgets/Header';

const PHOTO_ASPECT_CLASS = 'aspect-[358/287]';

interface OwnerAlbumPhotoDetailProps {
  photos: OwnerAlbumPhoto[];
  initialIndex: number;
  onClose: () => void;
}

function OwnerAlbumPhotoDetail({ photos, initialIndex, onClose }: OwnerAlbumPhotoDetailProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [swiperIndex, setSwiperIndex] = useState(initialIndex);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const currentPhoto = photos[activeIndex];
  const dayPosition = getAlbumDayPosition(photos, activeIndex);

  useEffect(() => {
    thumbnailRefs.current[activeIndex]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeIndex]);

  if (!currentPhoto || photos.length === 0) return null;

  const handleSlideChange = (index: number) => {
    setActiveIndex(index);
  };

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
    setSwiperIndex(index);
  };

  return (
    <RemoveScroll forwardProps>
      <div
        role='dialog'
        aria-modal='true'
        aria-label={formatAlbumDetailTitle(new Date(currentPhoto.uploadedAt))}
        className='bg-bg-50 z-modal fixed inset-0 flex flex-col'
      >
        <div className='bg-bg-0 shrink-0 pt-(--safe-area-inset-top,0px)'>
          <Header>
            <Header.LeftSection>
              <Header.BackButton onClick={onClose} />
            </Header.LeftSection>
            <Header.Title>{formatAlbumDetailTitle(new Date(currentPhoto.uploadedAt))}</Header.Title>
            <Header.RightSection>
              <button
                type='button'
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
              className='radius-r2 border-line-400 caption2-semibold text-text-secondary inline-flex min-w-[97px] items-center justify-center gap-1 border bg-white px-4 py-2'
            >
              {ownerAlbumContent.detail.saveLabel}
              <Icon icon='Download' className='size-3.5' />
            </button>
          </div>
        </div>

        <div className='bg-bg-50 relative flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-10'>
          <div className='relative w-full'>
            <SwiperRoot
              className='w-full'
              loop={false}
              initialIndex={swiperIndex}
              onSlideChange={handleSlideChange}
            >
              {photos.map((photo) => (
                <SwiperSlideItem key={photo.id}>
                  <div className={`bg-bg-50 relative w-full overflow-hidden ${PHOTO_ASPECT_CLASS}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- S3 pre-signed URL 임시 미리보기 */}
                    <img src={photo.url} alt='' className='absolute inset-0 h-full w-full object-cover' />
                  </div>
                </SwiperSlideItem>
              ))}
            </SwiperRoot>
          </div>

          {dayPosition.total > 0 ? (
            <span className='caption1-semibold text-text-primary-inverse bg-dim-70 absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full px-2 py-1'>
              {dayPosition.current}/{dayPosition.total}
            </span>
          ) : null}
        </div>

        <div className='bg-bg-0 shrink-0 pb-(--safe-area-inset-bottom,0px)'>
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
      </div>
    </RemoveScroll>
  );
}

export { OwnerAlbumPhotoDetail };
