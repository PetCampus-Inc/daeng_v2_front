'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Icon } from '@knockdog/ui';

import type { GuardianDailyNoticeMock } from '@views/guardian-kindergarten-page/config/guardianAttendanceMock';
import { guardianKindergartenAttendingContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenAttendingContent';
import {
  formatAttendingDuration,
  formatKoreanAmPmTime,
} from '@views/guardian-kindergarten-page/lib/formatGuardianAttendance';
import { formatKoreanDateWithWeekday } from '@views/guardian-kindergarten-page/lib/formatGuardianKindergartenDate';
import type { GuardianLinkedKindergarten } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

import { GuardianAlbumPhotoStack } from './GuardianAlbumPhotoStack';
import {
  GuardianDailyNoticeArrivedBanner,
  GuardianDailyNoticeTimelineCard,
} from './GuardianDailyNoticeCard';
import { GuardianKindergartenDateCalendar } from './GuardianKindergartenDateCalendar';
import { GuardianLinkedKindergartenCard } from './GuardianLinkedKindergartenCard';

interface GuardianKindergartenAttendingStateProps {
  kindergarten: GuardianLinkedKindergarten;
  checkInAt: Date;
  checkOutAt?: Date | null;
  hasDailyNotice: boolean;
  dailyNotice: GuardianDailyNoticeMock | null;
  albumPhotos: string[];
  attendanceRecordDateKeys: Set<string>;
}

function TimelineEventRow({
  timeLabel,
  label,
  showConnector,
}: {
  timeLabel: string;
  label: string;
  showConnector: boolean;
}) {
  return (
    <div className='flex w-full items-start gap-4'>
      <div className='flex w-12 shrink-0 flex-col items-center gap-2 self-stretch'>
        <p className='caption1-regular text-text-secondary'>{timeLabel}</p>
        {showConnector ? <div className='bg-line-200 w-px flex-1' /> : null}
      </div>
      <div className='pb-2'>
        <div className='bg-bg-50 radius-r2 flex h-9 w-[295px] max-w-full items-center justify-center px-4 py-2'>
          <p className='body2-regular text-text-primary'>{label}</p>
        </div>
      </div>
    </div>
  );
}

function GuardianKindergartenAttendingState({
  kindergarten,
  checkInAt,
  checkOutAt = null,
  hasDailyNotice,
  dailyNotice,
  albumPhotos,
  attendanceRecordDateKeys,
}: GuardianKindergartenAttendingStateProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [now, setNow] = useState(() => new Date());
  const content = guardianKindergartenAttendingContent;
  const { push } = useStackNavigation();
  const isDismissed = Boolean(checkOutAt);
  const checkInTimeLabel = formatKoreanAmPmTime(checkInAt);
  const checkOutTimeLabel = checkOutAt ? formatKoreanAmPmTime(checkOutAt) : null;
  const durationLabel = formatAttendingDuration(checkInAt, now);
  const statusBadgeLabel = isDismissed ? content.dayFinishedLabel : durationLabel;
  const noticeTimeLabel = dailyNotice ? formatKoreanAmPmTime(new Date(dailyNotice.writtenAt)) : null;
  const showNoticeCard = Boolean(hasDailyNotice && dailyNotice && noticeTimeLabel);
  const showAlbumArrived = albumPhotos.length > 0 && (isDismissed ? hasDailyNotice : true);

  const handleHistoryClick = () => {
    push({ pathname: route.compare.connectionHistory.root });
  };

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
        {hasDailyNotice && dailyNotice ? (
          <GuardianDailyNoticeArrivedBanner />
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
          <div className='flex w-full items-center justify-between'>
            <p className='h3-extrabold text-text-primary'>{content.albumTitle}</p>
            <button type='button' className='gap-x1 flex items-center justify-center rounded px-2 py-1'>
              <span className='label-semibold text-text-tertiary'>{content.albumViewAllLabel}</span>
              <Icon icon='ChevronRight' className='text-fill-secondary-500 size-4' />
            </button>
          </div>

          <div className='flex flex-col items-center gap-2'>
            <GuardianAlbumPhotoStack photos={albumPhotos} />
            {showAlbumArrived ? (
              <p className='body2-bold text-center'>
                <span className='text-text-accent'>{content.albumArrivedAccent}</span>
                <span className='text-text-secondary'>{content.albumArrivedSuffix}</span>
              </p>
            ) : null}
          </div>
        </section>
      </div>

      {/* 주간 캘린더 + 타임라인 */}
      <section className='flex w-full flex-col items-center'>
        <GuardianKindergartenDateCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          markedDateKeys={attendanceRecordDateKeys}
        />
        <div className='flex w-full flex-col gap-2 p-4'>
          <TimelineEventRow
            timeLabel={checkInTimeLabel}
            label={content.checkInLabel}
            showConnector={isDismissed || showNoticeCard}
          />

          {isDismissed && checkOutTimeLabel ? (
            <TimelineEventRow
              timeLabel={checkOutTimeLabel}
              label={content.checkOutLabel}
              showConnector={showNoticeCard}
            />
          ) : null}

          {showNoticeCard && dailyNotice && noticeTimeLabel ? (
            <GuardianDailyNoticeTimelineCard notice={dailyNotice} timeLabel={noticeTimeLabel} />
          ) : isDismissed ? (
            <p className='body1-medium text-text-tertiary pt-2'>{content.noNoticeMessage}</p>
          ) : null}
        </div>
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
