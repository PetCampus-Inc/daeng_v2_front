'use client';

import { Icon } from '@knockdog/ui';

import { guardianDailyNoticeListContent } from '@views/guardian-daily-notice-list-page/config/guardianDailyNoticeListContent';
import type { GuardianDailyNoticeMonthItem } from '@views/guardian-daily-notice-list-page/model/useGuardianDailyNoticeMonthList';
import { GuardianDailyNoticeListCard } from '@views/guardian-daily-notice-list-page/ui/GuardianDailyNoticeListCard';
import { WEEKDAY_LABELS, isSameDay } from '@shared/lib/calendar-date';

interface GuardianDailyNoticeListMonthListProps {
  items: GuardianDailyNoticeMonthItem[];
  /** 첫 등원 월이면 리스트 하단 시작 문구 날짜 */
  firstAttendanceDate?: Date | null;
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

function GuardianDailyNoticeListMonthList({
  items,
  firstAttendanceDate = null,
  onItemClick,
}: GuardianDailyNoticeListMonthListProps) {
  const { firstAttendance } = guardianDailyNoticeListContent;
  const today = new Date();

  return (
    <div className='flex w-full flex-col gap-5 p-4'>
      {items.map((item) => (
        <div key={item.dateKey} className='flex w-full items-start gap-2'>
          <NoticeListDate date={item.date} isToday={isSameDay(item.date, today)} />
          <div className='min-w-0 flex-1'>
            <GuardianDailyNoticeListCard
              item={item}
              dateLabel={`${item.date.getMonth() + 1}월 ${item.date.getDate()}일`}
              onClick={() => onItemClick?.(item)}
            />
          </div>
        </div>
      ))}

      {firstAttendanceDate ? (
        <div className='flex w-full items-start gap-2'>
          <NoticeListDate date={firstAttendanceDate} isToday={false} />
          <div className='bg-bg-100 radius-r3 flex min-w-0 flex-1 items-center justify-center gap-1 p-4'>
            <Icon icon='KindergartenFill' className='text-text-tertiary size-5 shrink-0' aria-hidden='true' />
            <span className='label-semibold text-text-tertiary'>{firstAttendance.message}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { GuardianDailyNoticeListMonthList };
