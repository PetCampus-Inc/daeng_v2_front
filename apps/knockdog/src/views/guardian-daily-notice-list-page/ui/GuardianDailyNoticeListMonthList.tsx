'use client';

import { Icon } from '@knockdog/ui';

import { guardianDailyNoticeListContent } from '@views/guardian-daily-notice-list-page/config/guardianDailyNoticeListContent';
import type {
  GuardianDailyNoticeMonthItem,
  GuardianDailyNoticeTimelineRow,
} from '@views/guardian-daily-notice-list-page/model/useGuardianDailyNoticeMonthList';
import { GuardianDailyNoticeListCard } from '@views/guardian-daily-notice-list-page/ui/GuardianDailyNoticeListCard';
import { WEEKDAY_LABELS, isSameDay } from '@shared/lib/calendar-date';

interface GuardianDailyNoticeListMonthListProps {
  timeline: GuardianDailyNoticeTimelineRow[];
  onItemClick?: (item: GuardianDailyNoticeMonthItem) => void;
}

interface NoticeListDateProps {
  date: Date;
  isToday: boolean;
}

function NoticeListDate({ date, isToday }: NoticeListDateProps) {
  const dayLabel = String(date.getDate()).padStart(2, '0');
  const weekdayLabel = WEEKDAY_LABELS[date.getDay()];

  return (
    <div className='flex w-6 shrink-0 flex-col items-start'>
      <span className={`h3-extrabold ${isToday ? 'text-text-accent' : 'text-text-primary'}`}>
        {dayLabel}
      </span>
      <span className='body2-regular text-text-secondary'>{weekdayLabel}</span>
    </div>
  );
}

function MembershipBanner({
  date,
  icon,
  message,
}: {
  date: Date;
  icon: 'CheckFill' | 'KindergartenFill';
  message: string;
}) {
  return (
    <div className='flex w-full items-start gap-2'>
      <NoticeListDate date={date} isToday={false} />
      <div className='bg-bg-100 radius-r3 flex min-w-0 flex-1 items-center justify-center gap-1 p-4'>
        <Icon icon={icon} className='text-text-tertiary size-5 shrink-0' aria-hidden='true' />
        <span className='label-semibold text-text-tertiary'>{message}</span>
      </div>
    </div>
  );
}

function GuardianDailyNoticeListMonthList({
  timeline,
  onItemClick,
}: GuardianDailyNoticeListMonthListProps) {
  const { attendedUntil, firstAttendance } = guardianDailyNoticeListContent;
  const today = new Date();

  return (
    <div className='flex w-full flex-col gap-5 p-4'>
      {timeline.map((row) => {
        if (row.type === 'disconnected') {
          return (
            <MembershipBanner
              key={row.id}
              date={row.date}
              icon='CheckFill'
              message={attendedUntil.message}
            />
          );
        }

        if (row.type === 'connected') {
          return (
            <MembershipBanner
              key={row.id}
              date={row.date}
              icon='KindergartenFill'
              message={firstAttendance.message}
            />
          );
        }

        return (
          <div key={row.id} className='flex w-full items-start gap-2'>
            <NoticeListDate date={row.date} isToday={isSameDay(row.date, today)} />
            <div className='min-w-0 flex-1'>
              <GuardianDailyNoticeListCard
                item={row.item}
                dateLabel={`${row.date.getMonth() + 1}월 ${row.date.getDate()}일`}
                onClick={() => onItemClick?.(row.item)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { GuardianDailyNoticeListMonthList };
