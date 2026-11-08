'use client';

import { useState, type ComponentProps } from 'react';

import { ChevronLeft, ChevronRight } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

import { RsvDayStatus, type RsvDayStatusKind } from '../rsv-day-status';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

interface RsvMonthlyCalendarProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (value: Date) => void;
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  today?: Date;
  reservedDates?: Date[];
  disabledDates?: Date[];
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function includesDay(dates: Date[] | undefined, day: Date) {
  return dates?.some((date) => isSameDay(date, day)) ?? false;
}

function buildWeeks(month: Date) {
  const first = startOfMonth(month);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = Array.from({ length: first.getDay() }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  }

  while (cells.length % 7 !== 0) cells.push(null);

  return Array.from({ length: cells.length / 7 }, (_, index) => cells.slice(index * 7, index * 7 + 7));
}

function resolveDayStatus(date: Date, selected: Date | undefined, today: Date | undefined, reservedDates: Date[] | undefined, disabledDates: Date[] | undefined): RsvDayStatusKind {
  const isSelected = selected ? isSameDay(date, selected) : false;
  const isToday = today ? isSameDay(date, today) : false;
  const isReserved = includesDay(reservedDates, date);

  if (isSelected && isToday) return 'todaySelected';
  if (isSelected && isReserved) return 'reservedSelected';
  if (isSelected) return 'selected';
  if (isToday) return 'today';
  if (isReserved) return 'reserved';
  if (includesDay(disabledDates, date)) return 'unselectable';
  return 'selectable';
}

/** V4 / Reservation / Monthly Calendar */
function RsvMonthlyCalendar({
  value,
  defaultValue,
  onValueChange,
  month,
  defaultMonth,
  onMonthChange,
  today,
  reservedDates,
  disabledDates,
  className,
  ...props
}: RsvMonthlyCalendarProps) {
  const [innerValue, setInnerValue] = useState(defaultValue);
  const [innerMonth, setInnerMonth] = useState(() => startOfMonth(defaultMonth ?? defaultValue ?? new Date()));
  const selected = value ?? innerValue;
  const visibleMonth = month ? startOfMonth(month) : innerMonth;
  const weeks = buildWeeks(visibleMonth);

  function changeMonth(nextMonth: Date) {
    const normalized = startOfMonth(nextMonth);
    setInnerMonth(normalized);
    onMonthChange?.(normalized);
  }

  function selectDate(nextValue: Date) {
    setInnerValue(nextValue);
    onValueChange?.(nextValue);
  }

  return (
    <div className={cn('bg-bg-0 flex w-full flex-col items-center pt-x5', className)} {...props}>
      <div className='flex w-full flex-col items-center gap-x4 px-x4'>
        <div className='flex w-full items-center justify-center px-x4'>
          <div className='flex items-center gap-x2 py-x1'>
            <button
              type='button'
              aria-label='이전 달'
              onClick={() => changeMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
              className='inline-flex items-center justify-center'
            >
              <ChevronLeft className='text-text-primary' />
            </button>
            <span className='h3-extrabold text-text-primary'>
              {visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월
            </span>
            <button
              type='button'
              aria-label='다음 달'
              onClick={() => changeMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
              className='inline-flex items-center justify-center'
            >
              <ChevronRight className='text-text-primary' />
            </button>
          </div>
        </div>
        <div className='flex w-full flex-col gap-x2 px-x4'>
          <div className='flex items-center justify-between'>
            {WEEKDAYS.map((weekday, index) => (
              <span
                key={weekday}
                className={cn(
                  'caption1-semibold flex size-[30px] items-center justify-center',
                  index === 0 ? 'text-[#dd5435]' : 'text-fill-secondary-500'
                )}
              >
                {weekday}
              </span>
            ))}
          </div>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className='flex items-center justify-between'>
              {week.map((date, dayIndex) => {
                if (!date) return <RsvDayStatus key={`${weekIndex}-${dayIndex}`} status='empty' />;

                const status = resolveDayStatus(date, selected, today, reservedDates, disabledDates);

                return (
                  <RsvDayStatus
                    key={date.toISOString()}
                    status={status}
                    aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일`}
                    onClick={() => selectDate(date)}
                  >
                    {date.getDate()}
                  </RsvDayStatus>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { RsvMonthlyCalendar };
export type { RsvMonthlyCalendarProps };
