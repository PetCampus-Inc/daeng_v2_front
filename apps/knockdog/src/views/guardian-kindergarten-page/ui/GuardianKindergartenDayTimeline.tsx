'use client';

import { guardianKindergartenAttendingContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenAttendingContent';
import type { GuardianDailyNoticeMock } from '@views/guardian-kindergarten-page/config/guardianAttendanceMock';
import { formatKoreanAmPmTime } from '@views/guardian-kindergarten-page/lib/formatGuardianAttendance';

import { GuardianDailyNoticeTimelineCard } from './GuardianDailyNoticeCard';

interface GuardianKindergartenDayTimelineProps {
  checkInAt: Date | null;
  checkOutAt?: Date | null;
  dailyNotice?: GuardianDailyNoticeMock | null;
  emptyMessage: string;
  isLoading?: boolean;
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

function GuardianKindergartenDayTimeline({
  checkInAt,
  checkOutAt = null,
  dailyNotice = null,
  emptyMessage,
  isLoading = false,
}: GuardianKindergartenDayTimelineProps) {
  const content = guardianKindergartenAttendingContent;

  if (isLoading) {
    return (
      <div className='flex w-full flex-col items-center p-4'>
        <p className='body1-medium text-text-tertiary text-center'>불러오는 중이에요</p>
      </div>
    );
  }

  if (!checkInAt) {
    return (
      <div className='flex w-full flex-col items-center p-4'>
        <p className='body1-medium text-text-tertiary text-center'>{emptyMessage}</p>
      </div>
    );
  }

  const isDismissed = Boolean(checkOutAt);
  const checkInTimeLabel = formatKoreanAmPmTime(checkInAt);
  const checkOutTimeLabel = checkOutAt ? formatKoreanAmPmTime(checkOutAt) : null;
  const noticeTimeLabel = dailyNotice
    ? formatKoreanAmPmTime(new Date(dailyNotice.writtenAt))
    : null;
  const showNoticeCard = Boolean(dailyNotice && noticeTimeLabel);

  return (
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
  );
}

export { GuardianKindergartenDayTimeline };
