'use client';

import { useMemo } from 'react';
import { Icon } from '@knockdog/ui';

import {
  WEEKDAY_SHORT,
  addDays,
  formatKoreanYearMonth,
  getWeekDays,
  isSameDay,
  startOfWeek,
} from '@views/guardian-kindergarten-page/lib/formatGuardianKindergartenDate';

interface GuardianKindergartenWeekCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

function GuardianKindergartenWeekCalendar({
  selectedDate,
  onSelectDate,
}: GuardianKindergartenWeekCalendarProps) {
  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const yearMonthLabel = formatKoreanYearMonth(selectedDate);

  return (
    <div className='px-x4 py-x5 flex w-full flex-col items-center gap-4'>
      <div className='flex items-center justify-center gap-1'>
        <p className='h3-extrabold text-text-primary'>{yearMonthLabel}</p>
        <Icon icon='Calendar' className='text-fill-secondary-700 size-5' aria-hidden='true' />
      </div>

      <div className='flex w-full items-center justify-between'>
        <button
          type='button'
          aria-label='이전 주'
          onClick={() => onSelectDate(addDays(selectedDate, -7))}
          className='shrink-0 p-0'
        >
          <Icon icon='ChevronLeft' className='text-fill-secondary-700 size-6' />
        </button>

        <div className='flex items-center'>
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            return (
              <button
                key={day.toISOString()}
                type='button'
                onClick={() => onSelectDate(day)}
                className={`flex w-[41px] flex-col items-center px-3 py-1.5 ${
                  isSelected ? 'bg-fill-secondary-700 radius-r2 text-text-primary-inverse' : 'text-text-secondary'
                }`}
              >
                <span className='caption1-semibold'>{WEEKDAY_SHORT[day.getDay()]}</span>
                <span className='body1-bold'>{day.getDate()}</span>
                <span className={`size-1 rounded-full ${isSelected ? 'bg-fill-primary-500' : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>

        <button
          type='button'
          aria-label='다음 주'
          onClick={() => onSelectDate(addDays(selectedDate, 7))}
          className='shrink-0 p-0'
        >
          <Icon icon='ChevronRight' className='text-fill-secondary-700 size-6' />
        </button>
      </div>
    </div>
  );
}

export { GuardianKindergartenWeekCalendar };
