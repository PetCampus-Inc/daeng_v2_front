'use client';

import { Icon } from '@knockdog/ui';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import type { GuardianAlbumDayAlbum } from '@views/guardian-album-page/config/guardianAlbumMonthMock';
import { parseDateKey } from '@views/guardian-album-page/config/guardianAlbumMonthMock';
import { formatKoreanDateWithWeekday } from '@views/guardian-kindergarten-page/lib/formatGuardianKindergartenDate';

const PREVIEW_LIMIT = 4;

interface GuardianAlbumDayCardProps {
  dayAlbum: GuardianAlbumDayAlbum;
}

function GuardianAlbumDayCard({ dayAlbum }: GuardianAlbumDayCardProps) {
  const { dayCard } = guardianAlbumContent;
  const dateLabel = formatKoreanDateWithWeekday(parseDateKey(dayAlbum.dateKey));
  const previewPhotos = dayAlbum.photos.slice(0, PREVIEW_LIMIT);
  const remainingCount = dayAlbum.photoCount - PREVIEW_LIMIT;

  return (
    <article className='bg-bg-0 radius-r3 flex w-full flex-col gap-4 p-4'>
      <div className='flex h-[26px] items-center justify-between'>
        <div className='gap-x2 flex items-center'>
          <p className='body2-semibold text-text-primary'>{dateLabel}</p>
          {dayAlbum.isAttended ? (
            <span className='bg-fill-primary-50 gap-x1 inline-flex items-center justify-center rounded-full px-2 py-1'>
              <Icon icon='Paw' className='text-text-accent size-4' aria-hidden='true' />
              <span className='caption1-semibold text-text-accent'>{dayCard.attendedBadgeLabel}</span>
            </span>
          ) : null}
        </div>
        <Icon icon='ChevronRight' className='text-fill-secondary-500 size-6 shrink-0' aria-hidden='true' />
      </div>

      <div className='flex w-full items-center justify-between'>
        {previewPhotos.map((photo, index) => {
          const isOverflowTile = remainingCount > 0 && index === PREVIEW_LIMIT - 1;

          return (
            <div key={photo.id} className='bg-fill-secondary-100 relative size-[78px] overflow-hidden rounded-lg'>
              {/* eslint-disable-next-line @next/next/no-img-element -- mock/S3 앨범 썸네일 */}
              <img src={photo.url} alt='' className='size-full object-cover' loading='lazy' decoding='async' />
              {isOverflowTile ? (
                <div className='bg-dim-70 absolute inset-0 flex items-center justify-center rounded-lg'>
                  <span className='caption2-medium text-text-primary-inverse'>
                    {dayCard.overflowLabel(remainingCount)}
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </article>
  );
}

export { GuardianAlbumDayCard };
