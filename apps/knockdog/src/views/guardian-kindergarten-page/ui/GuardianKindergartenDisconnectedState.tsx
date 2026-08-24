'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ActionButton, Icon } from '@knockdog/ui';

import { guardianKindergartenDisconnectedContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenDisconnectedContent';
import { formatKoreanDateWithWeekday } from '@views/guardian-kindergarten-page/lib/formatGuardianKindergartenDate';
import { pushGuardianDailyNoticeDetail } from '@views/guardian-kindergarten-page/lib/pushGuardianDailyNoticeDetail';
import type { GuardianLinkedKindergarten } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';
import { useGuardianCalendarDay } from '@views/guardian-kindergarten-page/model/useGuardianCalendarDay';
import { useGuardianDisconnectedMembership } from '@views/guardian-kindergarten-page/model/useGuardianDisconnectedMembership';
import { route } from '@shared/constants/route';
import { formatDateKey, startOfDay } from '@shared/lib/calendar-date';
import { useStackNavigation } from '@shared/lib/bridge';

import { GuardianAlbumPhotoStack } from './GuardianAlbumPhotoStack';
import { GuardianKindergartenDateCalendar } from './GuardianKindergartenDateCalendar';
import { GuardianKindergartenDayTimeline } from './GuardianKindergartenDayTimeline';
import { GuardianLinkedKindergartenCard } from './GuardianLinkedKindergartenCard';

interface GuardianKindergartenDisconnectedStateProps {
  kindergarten: GuardianLinkedKindergarten;
  albumPhotos: string[];
  /** 해당 유치원 첫 등원일 — 캘린더 minDate·주황점 하한 */
  firstAttendedAt?: Date | null;
  initialSelectedDate?: Date | null;
}

function GuardianKindergartenDisconnectedState({
  kindergarten,
  albumPhotos,
  firstAttendedAt = null,
  initialSelectedDate = null,
}: GuardianKindergartenDisconnectedStateProps) {
  const content = guardianKindergartenDisconnectedContent;
  const { push } = useStackNavigation();
  const { disconnectedAt, connectedAt } = useGuardianDisconnectedMembership({
    schoolId: kindergarten.id,
  });
  const [selectedDate, setSelectedDate] = useState(
    () => initialSelectedDate ?? disconnectedAt ?? startOfDay(new Date())
  );
  const hasAlbumPhotos = albumPhotos.length > 0;

  const {
    checkInAt,
    checkOutAt,
    dailyNotice,
    isPending: isCalendarDayPending,
  } = useGuardianCalendarDay({ selectedDate });

  useEffect(() => {
    const next = initialSelectedDate ?? disconnectedAt;
    if (!next) return;
    setSelectedDate((prev) => (formatDateKey(prev) === formatDateKey(next) ? prev : next));
  }, [disconnectedAt, initialSelectedDate]);

  const handleHistoryClick = () => {
    push({ pathname: route.compare.connectionHistory.root });
  };

  const handleAlbumViewAllClick = () => {
    push({ pathname: route.compare.album.root });
  };

  return (
    <div className='min-h-0 w-full flex-1 overflow-y-auto pb-(--bottom-bar-height)'>
      <div className='px-x4 flex w-full flex-col gap-5 py-6'>
        {/* 선택 날짜 */}
        <div className='gap-x1 flex w-full items-center'>
          <Icon icon='Paw' className='text-fill-secondary-400 size-6' aria-hidden='true' />
          <p className='h3-extrabold text-text-primary'>{formatKoreanDateWithWeekday(selectedDate)}</p>
        </div>

        {/* 연결 해제 배너 */}
        <div className='bg-bg-50 radius-r3 flex h-16 w-full items-center justify-center overflow-hidden px-4'>
          <p className='body2-bold text-center'>
            <span className='text-text-primary'>{kindergarten.name}</span>
            <span className='text-text-secondary'>{content.bannerSuffix}</span>
          </p>
        </div>

        {/* 마지막 앨범 */}
        <section className='flex w-full flex-col items-center gap-5'>
          <div className={`flex w-full items-center ${hasAlbumPhotos ? 'justify-between' : ''}`}>
            <p className='h3-extrabold text-text-primary'>{content.albumTitle}</p>
            {hasAlbumPhotos ? (
              <button
                type='button'
                className='gap-x1 flex items-center justify-center rounded px-2 py-1'
                onClick={handleAlbumViewAllClick}
              >
                <span className='label-semibold text-text-tertiary'>{content.albumViewAllLabel}</span>
                <Icon icon='ChevronRight' className='text-fill-secondary-500 size-4' />
              </button>
            ) : null}
          </div>

          {hasAlbumPhotos ? (
            <button
              type='button'
              className='relative'
              onClick={handleAlbumViewAllClick}
              aria-label={content.albumTitle}
            >
              <GuardianAlbumPhotoStack photos={albumPhotos} />
            </button>
          ) : (
            <>
              <div className='relative size-[200px] shrink-0'>
                <Image
                  src={content.albumEmptyImageSrc}
                  alt={content.albumEmptyImageAlt}
                  fill
                  className='object-contain'
                  sizes='200px'
                  priority
                />
              </div>
              <div className='flex w-[174px] flex-col items-center gap-4'>
                <p className='body1-bold text-text-primary text-center'>{content.albumEmptyTitle}</p>
                <ActionButton
                  type='button'
                  variant='primaryLine'
                  size='medium'
                  className='w-auto'
                  onClick={handleAlbumViewAllClick}
                >
                  {content.albumPreviousLabel}
                  <Icon icon='ChevronRight' className='text-text-accent size-5' />
                </ActionButton>
              </div>
            </>
          )}
        </section>
      </div>

      {/* 캘린더 + 타임라인 (해제일 이전·당일만) */}
      <section className='flex w-full flex-col items-center'>
        <GuardianKindergartenDateCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          firstAttendedAt={firstAttendedAt ?? undefined}
          minDate={connectedAt ?? undefined}
          maxDate={disconnectedAt ?? undefined}
        />
        <GuardianKindergartenDayTimeline
          checkInAt={checkInAt}
          checkOutAt={checkOutAt}
          dailyNotice={dailyNotice}
          emptyMessage={content.noAttendanceMessage}
          noNoticeMessage={content.noNoticeMessage}
          isLoading={isCalendarDayPending}
          onNoticeViewAllClick={() => pushGuardianDailyNoticeDetail(push, selectedDate)}
        />
      </section>

      {/* 유치원 카드 + 이력 */}
      <section className='px-x4 mt-4 flex w-full flex-col items-center gap-4 pb-5'>
        <GuardianLinkedKindergartenCard kindergarten={kindergarten} />
        <button
          type='button'
          className='gap-x1 flex items-center justify-center rounded px-2 py-1'
          onClick={handleHistoryClick}
        >
          <span className='label-semibold text-text-tertiary'>{content.historyLabel}</span>
          <Icon icon='ChevronRight' className='text-fill-secondary-500 size-4' />
        </button>
      </section>
    </div>
  );
}

export { GuardianKindergartenDisconnectedState };
