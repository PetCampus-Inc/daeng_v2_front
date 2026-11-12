'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ActionButton, Icon } from '@knockdog/ui';

import { useLiveAlbumLastViewedAt } from '@views/guardian-album-page/model/useGuardianAlbumLastViewed';
import { GuardianKindergartenNewsSection } from '@views/guardian-kindergarten-news-page';
import { useGuardianNewsPreview } from '@views/guardian-kindergarten-news-page/model/useGuardianKindergartenNews';
import { guardianKindergartenAttendingContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenAttendingContent';
import { pushGuardianDailyNoticeDetail } from '@views/guardian-kindergarten-page/lib/pushGuardianDailyNoticeDetail';
import {
  pushGuardianDailyNoticeList,
  toMonthQuery,
} from '@views/guardian-kindergarten-page/lib/pushGuardianDailyNoticeList';
import type { GuardianLinkedKindergarten } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';
import { useGuardianCalendarDay } from '@views/guardian-kindergarten-page/model/useGuardianCalendarDay';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

import { GuardianAlbumPhotoStack } from './GuardianAlbumPhotoStack';
import { GuardianDiarySegmentFrame } from './GuardianDiarySegmentFrame';
import { GuardianKindergartenHomeSegment } from './GuardianKindergartenHomeSegment';
import { GuardianDailyNoticeArrivedBanner } from './GuardianDailyNoticeCard';
import { GuardianKindergartenDateCalendar } from './GuardianKindergartenDateCalendar';
import { GuardianKindergartenDayTimeline } from './GuardianKindergartenDayTimeline';
import { GuardianLinkedKindergartenCard } from './GuardianLinkedKindergartenCard';

interface GuardianKindergartenAttendingStateProps {
  kindergarten: GuardianLinkedKindergarten;
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
  checkOutAt = null,
  hasDailyNotice,
  albumPhotos,
  albumLatestCreatedAt = null,
  firstAttendedAt = null,
  initialSelectedDate = null,
}: GuardianKindergartenAttendingStateProps) {
  const [selectedDate, setSelectedDate] = useState(() => initialSelectedDate ?? new Date());
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
  const showAlbumArrived = hasUnseenAlbumPhotos && (isDismissed ? hasDailyNotice : true);
  const { items: newsPreviewItems, isPending: isNewsPreviewPending } = useGuardianNewsPreview(
    kindergarten.id
  );

  const handleNoticeViewClick = () => {
    pushGuardianDailyNoticeDetail(push, new Date(), { schoolId: kindergarten.id });
  };

  const handleHistoryClick = () => {
    push({ pathname: route.kindergarten.connectionHistory.root });
  };

  const handleAlbumViewAllClick = () => {
    push({ pathname: route.kindergarten.album.root });
  };

  const handleAlbumShortcutClick = () => {
    push({ pathname: route.kindergarten.album.root, query: { from: 'home' } });
  };

  useEffect(() => {
    if (initialSelectedDate) setSelectedDate(initialSelectedDate);
  }, [initialSelectedDate]);

  return (
    <GuardianDiarySegmentFrame>
      <div className='min-h-0 w-full flex-1 overflow-y-auto pb-(--bottom-bar-height)'>
      <div className='px-x4 flex w-full flex-col gap-5 pt-6'>
        <GuardianKindergartenHomeSegment />

        {hasDailyNotice ? (
          <GuardianDailyNoticeArrivedBanner onViewClick={handleNoticeViewClick} />
        ) : (
          <div className='bg-bg-50 radius-r3 flex h-16 w-full items-center justify-center px-4'>
            <p className='body2-bold text-text-secondary'>{content.noticePreparingMessage}</p>
          </div>
        )}
      </div>

      <section className='flex w-full flex-col items-center'>
        <GuardianKindergartenDateCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          schoolId={kindergarten.id}
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
          onPastNoticesClick={() =>
            pushGuardianDailyNoticeList(push, {
              schoolId: kindergarten.id,
              month: toMonthQuery(selectedDate),
            })
          }
        />
      </section>

      <div className='px-x4 flex w-full flex-col gap-5 pt-5'>
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

      {/* 유치원 새소식 */}
      <section className='px-x4 mt-4 flex w-full flex-col items-center'>
        <GuardianKindergartenNewsSection
          variant={newsPreviewItems.length > 0 ? 'list' : 'empty'}
          items={newsPreviewItems}
          schoolId={kindergarten.id}
          isPending={isNewsPreviewPending}
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
    </GuardianDiarySegmentFrame>
  );
}

export { GuardianKindergartenAttendingState };
