'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ActionButton, Icon } from '@knockdog/ui';

import { GuardianKindergartenNewsSection } from '@views/guardian-kindergarten-news-page';
import { useGuardianNewsPreview } from '@views/guardian-kindergarten-news-page/model/useGuardianKindergartenNews';
import { guardianKindergartenApprovedContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenApprovedContent';
import { pushGuardianDailyNoticeDetail } from '@views/guardian-kindergarten-page/lib/pushGuardianDailyNoticeDetail';
import {
  pushGuardianDailyNoticeList,
  toMonthQuery,
} from '@views/guardian-kindergarten-page/lib/pushGuardianDailyNoticeList';
import type { GuardianLinkedKindergarten } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';
import { useGuardianCalendarDay } from '@views/guardian-kindergarten-page/model/useGuardianCalendarDay';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

import { GuardianKindergartenDateCalendar } from './GuardianKindergartenDateCalendar';
import { GuardianDiarySegmentFrame } from './GuardianDiarySegmentFrame';
import { GuardianKindergartenHomeSegment } from './GuardianKindergartenHomeSegment';
import { GuardianKindergartenDayTimeline } from './GuardianKindergartenDayTimeline';
import { GuardianLinkedKindergartenCard } from './GuardianLinkedKindergartenCard';

interface GuardianKindergartenApprovedStateProps {
  kindergarten: GuardianLinkedKindergarten;
  /** 해당 유치원 첫 등원일 — 캘린더 minDate·주황점 하한 */
  firstAttendedAt?: Date | null;
  initialSelectedDate?: Date | null;
}

function GuardianKindergartenApprovedState({
  kindergarten,
  firstAttendedAt = null,
  initialSelectedDate = null,
}: GuardianKindergartenApprovedStateProps) {
  const [selectedDate, setSelectedDate] = useState(() => initialSelectedDate ?? new Date());
  const content = guardianKindergartenApprovedContent;
  const { push } = useStackNavigation();
  const {
    checkInAt,
    checkOutAt,
    dailyNotice,
    isPending: isCalendarDayPending,
  } = useGuardianCalendarDay({ selectedDate, schoolId: kindergarten.id });

  useEffect(() => {
    if (initialSelectedDate) setSelectedDate(initialSelectedDate);
  }, [initialSelectedDate]);

  const { items: newsPreviewItems, isPending: isNewsPreviewPending } = useGuardianNewsPreview(
    kindergarten.id
  );

  const handleHistoryClick = () => {
    push({ pathname: route.kindergarten.connectionHistory.root });
  };

  const handleAlbumPreviousClick = () => {
    push({ pathname: route.kindergarten.album.root });
  };

  return (
    <GuardianDiarySegmentFrame>
      <div className='min-h-0 w-full flex-1 overflow-y-auto pb-(--bottom-bar-height)'>
      <div className='px-x4 flex w-full flex-col gap-5 pt-6'>
        <GuardianKindergartenHomeSegment />
        <div className='bg-bg-50 radius-r3 flex h-16 w-full items-center justify-center px-4'>
          <p className='body2-bold text-text-secondary'>{content.dailyEmptyMessage}</p>
        </div>
      </div>

      <section className='flex w-full flex-col items-center'>
        <GuardianKindergartenDateCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          schoolId={kindergarten.id}
          firstAttendedAt={firstAttendedAt ?? undefined}
        />
        <GuardianKindergartenDayTimeline
          checkInAt={checkInAt}
          checkOutAt={checkOutAt}
          dailyNotice={dailyNotice}
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
          <div className='flex w-full items-center'>
            <p className='h3-extrabold text-text-primary'>{content.albumTitle}</p>
          </div>
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
              onClick={handleAlbumPreviousClick}
            >
              {content.albumPreviousLabel}
              <Icon icon='ChevronRight' className='text-text-accent size-5' />
            </ActionButton>
          </div>
        </section>
      </div>

      {/* 유치원 새소식 */}
      <section className='px-x4 mt-6 flex w-full flex-col items-center'>
        <GuardianKindergartenNewsSection
          variant={newsPreviewItems.length > 0 ? 'list' : 'empty'}
          items={newsPreviewItems}
          schoolId={kindergarten.id}
          isPending={isNewsPreviewPending}
        />
      </section>

      {/* 유치원 카드 + 이력 */}
      <section className='px-x4 mt-6 flex w-full flex-col items-center gap-3 pb-5'>
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

export { GuardianKindergartenApprovedState };
