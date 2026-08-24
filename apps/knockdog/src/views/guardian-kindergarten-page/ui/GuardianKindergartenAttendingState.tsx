'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ActionButton, Icon } from '@knockdog/ui';

import { useLiveAlbumLastViewedAt } from '@views/guardian-album-page/model/useGuardianAlbumLastViewed';
import { guardianKindergartenAttendingContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenAttendingContent';
import { formatAttendingDuration } from '@views/guardian-kindergarten-page/lib/formatGuardianAttendance';
import { formatKoreanDateWithWeekday } from '@views/guardian-kindergarten-page/lib/formatGuardianKindergartenDate';
import { pushGuardianDailyNoticeDetail } from '@views/guardian-kindergarten-page/lib/pushGuardianDailyNoticeDetail';
import type { GuardianLinkedKindergarten } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';
import { useGuardianCalendarDay } from '@views/guardian-kindergarten-page/model/useGuardianCalendarDay';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

import { GuardianAlbumPhotoStack } from './GuardianAlbumPhotoStack';
import { GuardianDailyNoticeArrivedBanner } from './GuardianDailyNoticeCard';
import { GuardianKindergartenDateCalendar } from './GuardianKindergartenDateCalendar';
import { GuardianKindergartenDayTimeline } from './GuardianKindergartenDayTimeline';
import { GuardianLinkedKindergartenCard } from './GuardianLinkedKindergartenCard';

interface GuardianKindergartenAttendingStateProps {
  kindergarten: GuardianLinkedKindergarten;
  /** 오늘 등원 시각 (홈 API) — 헤더 배지·경과 시간 */
  checkInAt: Date;
  checkOutAt?: Date | null;
  hasDailyNotice: boolean;
  albumPhotos: string[];
  /** 오늘 앨범 프리뷰 중 가장 최근 업로드. 없으면 null */
  albumLatestCreatedAt?: number | null;
  /** 해당 유치원 첫 등원일 — 캘린더 minDate·주황점 하한 */
  firstAttendedAt?: Date | null;
  initialSelectedDate?: Date | null;
}

function GuardianKindergartenAttendingState({
  kindergarten,
  checkInAt,
  checkOutAt = null,
  hasDailyNotice,
  albumPhotos,
  albumLatestCreatedAt = null,
  firstAttendedAt = null,
  initialSelectedDate = null,
}: GuardianKindergartenAttendingStateProps) {
  const [selectedDate, setSelectedDate] = useState(() => initialSelectedDate ?? new Date());
  const [now, setNow] = useState(() => new Date());
  const content = guardianKindergartenAttendingContent;
  const { push } = useStackNavigation();
  const lastViewedAt = useLiveAlbumLastViewedAt();
  const {
    checkInAt: selectedCheckInAt,
    checkOutAt: selectedCheckOutAt,
    dailyNotice: selectedDailyNotice,
    isPending: isCalendarDayPending,
  } = useGuardianCalendarDay({ selectedDate, schoolId: kindergarten.id });

  const isDismissed = Boolean(checkOutAt);
  const hasAlbumPhotos = albumPhotos.length > 0;
  const hasUnseenAlbumPhotos =
    hasAlbumPhotos &&
    (albumLatestCreatedAt == null ? lastViewedAt === 0 : albumLatestCreatedAt > lastViewedAt);
  const durationLabel = formatAttendingDuration(checkInAt, now);
  const statusBadgeLabel = isDismissed ? content.dayFinishedLabel : durationLabel;
  const showAlbumArrived = hasUnseenAlbumPhotos && (isDismissed ? hasDailyNotice : true);

  const handleNoticeViewClick = () => {
    pushGuardianDailyNoticeDetail(push, new Date(), { schoolId: kindergarten.id });
  };

  const handleHistoryClick = () => {
    push({ pathname: route.compare.connectionHistory.root });
  };

  const handleAlbumViewAllClick = () => {
    push({ pathname: route.compare.album.root });
  };

  const handleAlbumShortcutClick = () => {
    push({ pathname: route.compare.album.root, query: { from: 'home' } });
  };

  useEffect(() => {
    if (initialSelectedDate) setSelectedDate(initialSelectedDate);
  }, [initialSelectedDate]);

  useEffect(() => {
    if (isDismissed) return;
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, [isDismissed]);

  return (
    <div className='min-h-0 w-full flex-1 overflow-y-auto pb-(--bottom-bar-height)'>
      <div className='px-x4 flex w-full flex-col gap-5 py-6'>
        {/* 날짜 + 등원 경과 / 하루 마침 */}
        <div className='flex w-full items-center justify-between'>
          <div className='gap-x1 flex items-center'>
            <Icon icon='Paw' className='text-text-accent size-6' aria-hidden='true' />
            <p className='h3-extrabold text-text-primary'>{formatKoreanDateWithWeekday(selectedDate)}</p>
          </div>
          <span
            className={
              isDismissed
                ? 'border-line-200 label-semibold text-text-secondary shrink-0 rounded-full border px-3.5 py-2'
                : 'border-line-accent label-semibold text-text-accent shrink-0 rounded-full border px-3.5 py-2'
            }
          >
            {statusBadgeLabel}
          </span>
        </div>

        {/* 알림장 */}
        {hasDailyNotice ? (
          <GuardianDailyNoticeArrivedBanner onViewClick={handleNoticeViewClick} />
        ) : (
          <div className='bg-bg-50 radius-r3 flex w-full items-center justify-center gap-2 overflow-hidden p-4'>
            <Image
              src={content.noticePreparingIconSrc}
              alt={content.noticePreparingIconAlt}
              width={32}
              height={32}
              className='size-8 shrink-0 object-contain'
            />
            <p className='body2-bold text-text-secondary'>{content.noticePreparingMessage}</p>
          </div>
        )}

        {/* 오늘의 앨범 */}
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
            <div className='flex flex-col items-center gap-2'>
              <button
                type='button'
                className='relative'
                onClick={handleAlbumShortcutClick}
                aria-label={content.albumTitle}
              >
                <GuardianAlbumPhotoStack photos={albumPhotos} />
              </button>
              {showAlbumArrived ? (
                <p className='body2-bold text-center'>
                  <span className='text-text-accent'>{content.albumArrivedAccent}</span>
                  <span className='text-text-secondary'>{content.albumArrivedSuffix}</span>
                </p>
              ) : null}
            </div>
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

      {/* 주간 캘린더 + 선택일 타임라인 */}
      <section className='flex w-full flex-col items-center'>
        <GuardianKindergartenDateCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          firstAttendedAt={firstAttendedAt ?? undefined}
        />
        <GuardianKindergartenDayTimeline
          checkInAt={selectedCheckInAt}
          checkOutAt={selectedCheckOutAt}
          dailyNotice={selectedDailyNotice}
          emptyMessage={content.calendarEmptyMessage}
          isLoading={isCalendarDayPending}
          onNoticeViewAllClick={() =>
            pushGuardianDailyNoticeDetail(push, selectedDate, { schoolId: kindergarten.id })
          }
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

export { GuardianKindergartenAttendingState };
