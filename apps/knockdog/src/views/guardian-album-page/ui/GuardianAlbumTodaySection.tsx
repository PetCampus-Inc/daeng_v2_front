'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@knockdog/ui';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import type { GuardianAlbumPhoto } from '@views/guardian-album-page/config/guardianAlbumTodayMock';
import { formatKoreanDateWithWeekday } from '@views/guardian-kindergarten-page/lib/formatGuardianKindergartenDate';

import { GuardianAlbumTodayPhotoStrip } from './GuardianAlbumTodayPhotoStrip';

interface GuardianAlbumTodaySectionProps {
  petName: string;
  isAttendedToday: boolean;
  todayPhotoCount: number;
  todayPhotos: GuardianAlbumPhoto[];
  lastViewedAt: number;
  onOpenDetail?: (photoId?: string) => void;
  onToggleFavorite?: (photoId: string, isFavorite: boolean) => Promise<void>;
}

const PREVIEW_LIMIT = 10;

function GuardianAlbumTodaySection({
  petName,
  isAttendedToday,
  todayPhotoCount,
  todayPhotos,
  lastViewedAt,
  onOpenDetail,
  onToggleFavorite,
}: GuardianAlbumTodaySectionProps) {
  const { today } = guardianAlbumContent;
  const dateLabel = formatKoreanDateWithWeekday(new Date());

  const previewPhotos = useMemo(
    () =>
      [...todayPhotos]
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
        .slice(0, PREVIEW_LIMIT),
    [todayPhotos]
  );

  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    return new Set(todayPhotos.filter((photo) => photo.isBookmarked).map((photo) => photo.id));
  });

  useEffect(() => {
    setBookmarkedIds(
      new Set(todayPhotos.filter((photo) => photo.isBookmarked).map((photo) => photo.id))
    );
  }, [todayPhotos]);

  const handleToggleBookmark = useCallback(
    (photoId: string) => {
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
    },
    [bookmarkedIds, onToggleFavorite]
  );

  const showPhotoPreview = isAttendedToday && previewPhotos.length > 0;

  return (
    <section className='bg-bg-0 flex w-full flex-col gap-4 pt-5'>
      <div className='flex items-end gap-4 px-4'>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <p className='body1-bold text-text-primary'>{dateLabel}</p>
          {isAttendedToday ? (
            <p className='h2-extrabold flex min-w-0 items-start'>
              <span className='text-text-accent truncate'>{petName}</span>
              <span className='text-text-primary shrink-0'>{today.titleSuffix}</span>
            </p>
          ) : (
            <p className='h2-extrabold text-text-primary'>{today.notAttendedTitle}</p>
          )}
        </div>

        {showPhotoPreview ? (
          <button
            type='button'
            className='bg-fill-primary-50 gap-x1 flex shrink-0 items-center rounded-full px-2 py-1'
            aria-label={today.photoCountAriaLabel}
            onClick={() => onOpenDetail?.()}
          >
            <Icon icon='Camera' className='text-text-accent size-4' aria-hidden='true' />
            <span className='caption1-extrabold text-text-accent'>
              {today.photoCountLabel(todayPhotoCount)}
            </span>
            <Icon icon='ChevronRight' className='text-text-accent size-4' aria-hidden='true' />
          </button>
        ) : null}
      </div>

      {showPhotoPreview ? (
        <GuardianAlbumTodayPhotoStrip
          photos={previewPhotos}
          totalPhotoCount={todayPhotoCount}
          lastViewedAt={lastViewedAt}
          bookmarkedIds={bookmarkedIds}
          onToggleBookmark={handleToggleBookmark}
          onPhotoClick={(photoId) => onOpenDetail?.(photoId)}
          onOverflowClick={() => onOpenDetail?.()}
        />
      ) : null}
    </section>
  );
}

export { GuardianAlbumTodaySection };
