'use client';

import { Icon } from '@knockdog/ui';

import { AlbumImage } from '@shared/ui/album-image';
import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import { parseDateKey } from '@views/guardian-album-page/config/guardianAlbumMonthMock';
import { formatKoreanDateWithWeekday } from '@views/guardian-kindergarten-page/lib/formatGuardianKindergartenDate';
import type { GuardianAlbumPhoto } from '@views/guardian-album-page/config/guardianAlbumTodayMock';

const PREVIEW_LIMIT = 6;

interface GuardianAlbumFilterDay {
  dateKey: string;
  isAttended: boolean;
  photoCount: number;
  photos: GuardianAlbumPhoto[];
}

interface GuardianAlbumFilterDaySectionProps {
  day: GuardianAlbumFilterDay;
  /** 초과분 라벨. 기본 `+ N` */
  overflowLabel?: (remaining: number) => string;
  onClick?: (day: GuardianAlbumFilterDay) => void;
}

function GuardianAlbumFilterDaySection({
  day,
  overflowLabel = guardianAlbumContent.dayCard.overflowLabel,
  onClick,
}: GuardianAlbumFilterDaySectionProps) {
  const { dayCard } = guardianAlbumContent;
  const dateLabel = formatKoreanDateWithWeekday(parseDateKey(day.dateKey));
  const previewPhotos = day.photos.slice(0, PREVIEW_LIMIT);
  const remainingCount = day.photoCount - PREVIEW_LIMIT;
  const isClickable = Boolean(onClick) && day.photos.length > 0;

  return (
    <section
      className={`flex w-full min-w-0 flex-col gap-4 ${isClickable ? 'cursor-pointer' : ''}`}
      onClick={isClickable ? () => onClick?.(day) : undefined}
      onKeyDown={
        isClickable
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick?.(day);
              }
            }
          : undefined
      }
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? dayCard.detailAriaLabel : undefined}
    >
      <div className='flex h-[26px] w-full items-center justify-between'>
        <p className='body1-extrabold text-text-primary min-w-0 flex-1'>{dateLabel}</p>
        {day.isAttended ? (
          <span className='bg-fill-primary-50 gap-x1 inline-flex shrink-0 items-center justify-center rounded-full px-2 py-1'>
            <Icon icon='Paw' className='text-text-accent size-4' aria-hidden='true' />
            <span className='caption1-semibold text-text-accent'>{dayCard.attendedBadgeLabel}</span>
          </span>
        ) : null}
      </div>

      <div className='grid w-full min-w-0 grid-cols-3 gap-1'>
        {previewPhotos.map((photo, index) => {
          const isOverflowTile = remainingCount > 0 && index === PREVIEW_LIMIT - 1;

          return (
            <div
              key={photo.id}
              className='relative aspect-square min-h-0 min-w-0 overflow-hidden rounded-lg'
            >
              <AlbumImage src={photo.url} className='absolute inset-0 bg-fill-secondary-100' />
              {isOverflowTile ? (
                <div className='bg-dim-70 absolute inset-0 z-10 flex items-center justify-center rounded-lg'>
                  <span className='body2-semibold text-text-primary-inverse'>
                    {overflowLabel(remainingCount)}
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

export { GuardianAlbumFilterDaySection };
export type { GuardianAlbumFilterDay };
