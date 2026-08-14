'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { Icon } from '@knockdog/ui';

import type { GuardianAlbumPhoto } from '@entities/guardian-album';
import { AlbumImage } from '@shared/ui/album-image';
import { guardianDailyNoticeContent } from '@views/guardian-daily-notice-page/config/guardianDailyNoticeContent';
import { NOTICE_ALBUM_PREVIEW_LIMIT } from '@views/guardian-daily-notice-page/model/useGuardianDailyNoticeDayAlbum';

interface GuardianDailyNoticeSectionProps {
  iconSrc: string;
  title: string;
  children: ReactNode;
}

function GuardianDailyNoticeSection({ iconSrc, title, children }: GuardianDailyNoticeSectionProps) {
  return (
    <div className='flex w-full items-start gap-2'>
      <div className='size-6 shrink-0 overflow-hidden rounded'>
        <Image src={iconSrc} alt='' width={24} height={24} className='size-6 object-cover' />
      </div>
      <div className='flex min-w-0 flex-1 flex-col gap-2'>
        <p className='h3-semibold text-text-primary'>{title}</p>
        {children}
      </div>
    </div>
  );
}

interface GuardianDailyNoticeStoolBadgeProps {
  label: string;
}

function GuardianDailyNoticeStoolBadge({ label }: GuardianDailyNoticeStoolBadgeProps) {
  return (
    <div className='bg-fill-primary-50 radius-r2 flex h-9 w-full items-center justify-center px-4'>
      <div className='flex items-center justify-center gap-1'>
        <Icon icon='Plus' className='text-text-accent size-5' aria-hidden='true' />
        <span className='label-semibold text-text-accent'>{label}</span>
      </div>
    </div>
  );
}

interface GuardianDailyNoticeAlbumSectionProps {
  photos: GuardianAlbumPhoto[];
  photoCount: number;
  onAlbumClick: () => void;
}

function GuardianDailyNoticeAlbumSection({
  photos,
  photoCount,
  onAlbumClick,
}: GuardianDailyNoticeAlbumSectionProps) {
  const content = guardianDailyNoticeContent;
  if (photos.length === 0) return null;

  const previewPhotos = photos.slice(0, NOTICE_ALBUM_PREVIEW_LIMIT);
  const remainingCount = Math.max(photoCount - previewPhotos.length, 0);

  return (
    <div className='flex w-full flex-col gap-3'>
      <button
        type='button'
        className='flex w-full items-center justify-between'
        onClick={onAlbumClick}
        aria-label={content.albumViewAriaLabel}
      >
        <span className='body2-semibold text-text-primary'>{content.albumViewLabel}</span>
        <Icon icon='ChevronRight' className='text-text-primary size-5' aria-hidden='true' />
      </button>

      <div className='grid w-full grid-cols-4 gap-2.5'>
        {previewPhotos.map((photo, index) => {
          const isOverflowTile = remainingCount > 0 && index === previewPhotos.length - 1;

          return (
            <div
              key={photo.id}
              className='relative aspect-square min-w-0 overflow-hidden rounded'
            >
              <AlbumImage src={photo.url} className='absolute inset-0 bg-fill-secondary-100' />
              {isOverflowTile ? (
                <div className='bg-dim-70 absolute inset-0 z-10 flex items-center justify-center rounded'>
                  <span className='body2-regular text-text-primary-inverse'>
                    {content.albumOverflowLabel(remainingCount)}
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SPRING_RING_COUNT = 11;

function GuardianDailyNoticeSpring() {
  const content = guardianDailyNoticeContent;

  return (
    <div className='pointer-events-none absolute inset-x-0 bottom-0 z-10 flex translate-y-[calc(50%+4px)] items-center justify-center gap-[26px] px-4'>
      {Array.from({ length: SPRING_RING_COUNT }, (_, index) => (
        <Image
          key={index}
          src={content.springRingSrc}
          alt=''
          width={9}
          height={19}
          unoptimized
          className='h-[19px] w-[9px] shrink-0'
        />
      ))}
    </div>
  );
}

export {
  GuardianDailyNoticeAlbumSection,
  GuardianDailyNoticeSection,
  GuardianDailyNoticeSpring,
  GuardianDailyNoticeStoolBadge,
};
