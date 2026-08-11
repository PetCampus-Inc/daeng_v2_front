'use client';

import { Icon } from '@knockdog/ui';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import type { GuardianAlbumFavoriteDay } from '@views/guardian-album-page/config/guardianAlbumFavoriteMock';
import { FAVORITE_PREVIEW_LIMIT } from '@views/guardian-album-page/config/guardianAlbumFavoriteMock';
import { parseDateKey } from '@views/guardian-album-page/config/guardianAlbumMonthMock';
import { formatKoreanDateWithWeekday } from '@views/guardian-kindergarten-page/lib/formatGuardianKindergartenDate';

interface GuardianAlbumFavoriteDaySectionProps {
  day: GuardianAlbumFavoriteDay;
}

function GuardianAlbumFavoriteDaySection({ day }: GuardianAlbumFavoriteDaySectionProps) {
  const { dayCard, favoriteList } = guardianAlbumContent;
  const dateLabel = formatKoreanDateWithWeekday(parseDateKey(day.dateKey));
  const previewPhotos = day.photos.slice(0, FAVORITE_PREVIEW_LIMIT);
  const remainingCount = day.photoCount - FAVORITE_PREVIEW_LIMIT;

  return (
    <section className='flex w-full flex-col gap-4'>
      <div className='flex h-[26px] w-full items-center justify-between'>
        <p className='body1-extrabold text-text-primary min-w-0 flex-1'>{dateLabel}</p>
        {day.isAttended ? (
          <span className='bg-fill-primary-50 gap-x1 inline-flex shrink-0 items-center justify-center rounded-full px-2 py-1'>
            <Icon icon='Paw' className='text-text-accent size-4' aria-hidden='true' />
            <span className='caption1-semibold text-text-accent'>{dayCard.attendedBadgeLabel}</span>
          </span>
        ) : null}
      </div>

      <div className='grid w-full grid-cols-3 gap-1'>
        {previewPhotos.map((photo, index) => {
          const isOverflowTile = remainingCount > 0 && index === FAVORITE_PREVIEW_LIMIT - 1;

          return (
            <div
              key={photo.id}
              className='bg-fill-secondary-100 relative aspect-square overflow-hidden rounded-lg'
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- mock/S3 앨범 썸네일 */}
              <img src={photo.url} alt='' className='size-full object-cover' loading='lazy' decoding='async' />
              {isOverflowTile ? (
                <div className='bg-dim-70 absolute inset-0 flex items-center justify-center rounded-lg'>
                  <span className='caption2-medium text-text-primary-inverse'>
                    {favoriteList.overflowLabel(remainingCount)}
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export { GuardianAlbumFavoriteDaySection };
