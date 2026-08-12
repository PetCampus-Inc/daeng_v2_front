'use client';

import { useMemo } from 'react';

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
  /** 알림장 없을 때 문구. 미지정 시 attending content 기본값 */
  noNoticeMessage?: string;
}

type TimelineEvent =
  | {
      kind: 'checkIn' | 'checkOut';
      at: number;
      timeLabel: string;
      label: string;
    }
  | {
      kind: 'notice';
      at: number;
      timeLabel: string;
      notice: GuardianDailyNoticeMock;
    };

const EVENT_ORDER: Record<TimelineEvent['kind'], number> = {
  checkIn: 0,
  notice: 1,
  checkOut: 2,
};

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

function buildTimelineEvents(options: {
  checkInAt: Date;
  checkOutAt: Date | null;
  dailyNotice: GuardianDailyNoticeMock | null;
  checkInLabel: string;
  checkOutLabel: string;
}): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      kind: 'checkIn',
      at: options.checkInAt.getTime(),
      timeLabel: formatKoreanAmPmTime(options.checkInAt),
      label: options.checkInLabel,
    },
  ];

  if (options.checkOutAt) {
    events.push({
      kind: 'checkOut',
      at: options.checkOutAt.getTime(),
      timeLabel: formatKoreanAmPmTime(options.checkOutAt),
      label: options.checkOutLabel,
    });
  }

  if (options.dailyNotice) {
    const noticeAt = options.dailyNotice.writtenAt
      ? new Date(options.dailyNotice.writtenAt)
      : null;
    const hasValidWrittenAt = noticeAt != null && !Number.isNaN(noticeAt.getTime());

    events.push({
      kind: 'notice',
      // writtenAt 없으면 하원 직후(또는 맨 끝)
      at: hasValidWrittenAt
        ? noticeAt.getTime()
        : options.checkOutAt
          ? options.checkOutAt.getTime() + 1
          : Number.MAX_SAFE_INTEGER,
      timeLabel: hasValidWrittenAt ? formatKoreanAmPmTime(noticeAt) : '',
      notice: options.dailyNotice,
    });
  }

  return events.sort((a, b) => {
    if (a.at !== b.at) return a.at - b.at;
    return EVENT_ORDER[a.kind] - EVENT_ORDER[b.kind];
  });
}

function GuardianKindergartenDayTimeline({
  checkInAt,
  checkOutAt = null,
  dailyNotice = null,
  emptyMessage,
  isLoading = false,
  noNoticeMessage = guardianKindergartenAttendingContent.noNoticeMessage,
}: GuardianKindergartenDayTimelineProps) {
  const content = guardianKindergartenAttendingContent;

  const events = useMemo(() => {
    if (!checkInAt) return [];
    return buildTimelineEvents({
      checkInAt,
      checkOutAt,
      dailyNotice,
      checkInLabel: content.checkInLabel,
      checkOutLabel: content.checkOutLabel,
    });
  }, [checkInAt, checkOutAt, dailyNotice, content.checkInLabel, content.checkOutLabel]);

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
  const hasNotice = events.some((event) => event.kind === 'notice');

  return (
    <div className='flex w-full flex-col gap-2 p-4'>
      {events.map((event, index) => {
        const showConnector = index < events.length - 1;

        if (event.kind === 'notice') {
          return (
            <GuardianDailyNoticeTimelineCard
              key={`${event.kind}-${event.at}`}
              notice={event.notice}
              timeLabel={event.timeLabel}
            />
          );
        }

        return (
          <TimelineEventRow
            key={`${event.kind}-${event.at}`}
            timeLabel={event.timeLabel}
            label={event.label}
            showConnector={showConnector}
          />
        );
      })}

      {isDismissed && !hasNotice ? (
        <p className='body1-medium text-text-tertiary pt-2'>{noNoticeMessage}</p>
      ) : null}
    </div>
  );
}

export { GuardianKindergartenDayTimeline };
