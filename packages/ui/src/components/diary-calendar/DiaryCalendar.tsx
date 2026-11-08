'use client';

import { useState, type ComponentProps, type ReactNode } from 'react';

import { ChevronLeft, ChevronRight } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

import { DiaryCalendarDay, type DiaryCalendarDayState } from '../diary-calendar-day';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

interface DiaryCalendarProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (value: Date) => void;
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  today?: Date;
  getImage?: (date: Date) => ReactNode;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(left: Date, right: Date) {
  return startOfDay(left).getTime() === startOfDay(right).getTime();
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

function resolveDayState(date: Date, selected: Date | undefined, today: Date, image: ReactNode): DiaryCalendarDayState {
  const isSelected = selected ? isSameDay(date, selected) : false;
  const isToday = isSameDay(date, today);
  const hasImage = Boolean(image);

  if (isSelected && hasImage) return 'filledSelected';
  if (isSelected) return 'emptySelected';
  if (isToday && hasImage) return 'todayFilled';
  if (isToday) return 'todayEmpty';
  if (startOfDay(date).getTime() > startOfDay(today).getTime()) return hasImage ? 'filled' : 'futureEmpty';
  if (hasImage) return 'filled';
  return 'pastEmpty';
}

/** V4 / Dog Diary / Calendar */
function DiaryCalendar({
  value,
  defaultValue,
  onValueChange,
  month,
  defaultMonth,
  onMonthChange,
  today = new Date(),
  getImage,
  className,
  ...props
}: DiaryCalendarProps) {
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
    <div className={cn('bg-bg-0 gap-x3 px-x4 py-x6 flex w-full flex-col items-center', className)} {...props}>
      <div className='px-x4 flex w-full items-center justify-center'>
        <div className='gap-x2 py-x1 flex items-center'>
          <button
            type='button'
            aria-label='이전 달'
            onClick={() => changeMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
            className='inline-flex'
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
            className='inline-flex'
          >
            <ChevronRight className='text-text-primary' />
          </button>
        </div>
      </div>
      <div className='flex w-full items-center justify-between'>
        {WEEKDAYS.map((weekday, index) => (
          <span
            key={weekday}
            className={cn(
              'caption1-semibold flex h-[30px] flex-1 items-center justify-center',
              index === 0 ? 'text-[#dd5435]' : 'text-fill-secondary-500'
            )}
          >
            {weekday}
          </span>
        ))}
      </div>
      <div className='gap-x2 flex w-full flex-col'>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className='flex items-center justify-between'>
            {week.map((date, dayIndex) => {
              if (!date) return <DiaryCalendarDay key={`${weekIndex}-${dayIndex}`} state='empty' className='flex-1' />;

              const image = getImage?.(date);
              const state = resolveDayState(date, selected, today, image);

              return (
                <DiaryCalendarDay
                  key={date.toISOString()}
                  state={state}
                  image={image}
                  className='flex-1'
                  aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일`}
                  onClick={() => selectDate(date)}
                >
                  {date.getDate()}
                </DiaryCalendarDay>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export { DiaryCalendar };
export type { DiaryCalendarProps };
