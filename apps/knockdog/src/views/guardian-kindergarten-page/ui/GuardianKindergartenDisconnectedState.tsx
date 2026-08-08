'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@knockdog/ui';

import { guardianKindergartenDisconnectedContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenDisconnectedContent';
import { formatKoreanAmPmTime } from '@views/guardian-kindergarten-page/lib/formatGuardianAttendance';
import { formatKoreanDateWithWeekday } from '@views/guardian-kindergarten-page/lib/formatGuardianKindergartenDate';
import type { GuardianLinkedKindergarten } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';
import { useGuardianDisconnectedDay } from '@views/guardian-kindergarten-page/model/useGuardianDisconnectedDay';
import { route } from '@shared/constants/route';
import { formatDateKey, startOfDay } from '@shared/lib/calendar-date';
import { useStackNavigation } from '@shared/lib/bridge';

import { GuardianAlbumPhotoStack } from './GuardianAlbumPhotoStack';
import { GuardianDailyNoticeTimelineCard } from './GuardianDailyNoticeCard';
import { GuardianKindergartenDateCalendar } from './GuardianKindergartenDateCalendar';
import { GuardianLinkedKindergartenCard } from './GuardianLinkedKindergartenCard';

interface GuardianKindergartenDisconnectedStateProps {
  kindergarten: GuardianLinkedKindergarten;
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

function GuardianKindergartenDisconnectedState({
  kindergarten,
}: GuardianKindergartenDisconnectedStateProps) {
  const content = guardianKindergartenDisconnectedContent;
  const { push } = useStackNavigation();
  const {
    disconnectedAt,
    lastAlbumPhotos,
    attendanceRecordDateKeys,
    getDayRecord,
  } = useGuardianDisconnectedDay();

  const [selectedDate, setSelectedDate] = useState(() => startOfDay(disconnectedAt));

  const selectedDateKey = formatDateKey(selectedDate);
  const dayRecord = useMemo(() => getDayRecord(selectedDateKey), [getDayRecord, selectedDateKey]);

  const checkInAt = dayRecord ? new Date(dayRecord.checkInAt) : null;
  const checkOutAt = dayRecord ? new Date(dayRecord.checkOutAt) : null;
  const dailyNotice = dayRecord?.dailyNotice ?? null;
  const checkInTimeLabel = checkInAt ? formatKoreanAmPmTime(checkInAt) : null;
  const checkOutTimeLabel = checkOutAt ? formatKoreanAmPmTime(checkOutAt) : null;
  const noticeTimeLabel = dailyNotice
    ? formatKoreanAmPmTime(new Date(dailyNotice.writtenAt))
    : null;
  const showNoticeCard = Boolean(dailyNotice && noticeTimeLabel);

  const handleHistoryClick = () => {
    push({ pathname: route.compare.connectionHistory.root });
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
          <div className='flex w-full items-center justify-between'>
            <p className='h3-extrabold text-text-primary'>{content.albumTitle}</p>
            <button type='button' className='gap-x1 flex items-center justify-center rounded px-2 py-1'>
              <span className='label-semibold text-text-tertiary'>{content.albumViewAllLabel}</span>
              <Icon icon='ChevronRight' className='text-fill-secondary-500 size-4' />
            </button>
          </div>
          <GuardianAlbumPhotoStack photos={lastAlbumPhotos} />
        </section>
      </div>

      {/* 캘린더 + 타임라인 (해제일 이전·당일만) */}
      <section className='flex w-full flex-col items-center'>
        <GuardianKindergartenDateCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          markedDateKeys={attendanceRecordDateKeys}
          maxDate={disconnectedAt}
        />
        {checkInAt && checkInTimeLabel ? (
          <div className='flex w-full flex-col gap-2 p-4'>
            <TimelineEventRow
              timeLabel={checkInTimeLabel}
              label={content.checkInLabel}
              showConnector={showNoticeCard || Boolean(checkOutAt)}
            />

            {showNoticeCard && dailyNotice && noticeTimeLabel ? (
              <GuardianDailyNoticeTimelineCard notice={dailyNotice} timeLabel={noticeTimeLabel} />
            ) : null}

            {checkOutAt && checkOutTimeLabel ? (
              <TimelineEventRow
                timeLabel={checkOutTimeLabel}
                label={content.checkOutLabel}
                showConnector={false}
              />
            ) : null}

            {!showNoticeCard ? (
              <p className='body1-medium text-text-tertiary pt-2'>{content.noNoticeMessage}</p>
            ) : null}
          </div>
        ) : (
          <div className='flex w-full flex-col p-4'>
            <p className='body1-medium text-text-tertiary'>{content.noAttendanceMessage}</p>
          </div>
        )}
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
