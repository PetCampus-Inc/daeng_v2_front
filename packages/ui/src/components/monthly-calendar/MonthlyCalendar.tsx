'use client';

import { useState, type ComponentProps } from 'react';

import { cn } from '@knockdog/ui/lib';

import { TodayButton } from '../today-button';
import chevronNext from './chevron-next.svg';
import selectedDay from './selected-day.svg';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

interface MonthlyCalendarProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (value: Date) => void;
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
}

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
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

/** V4 / Calendar / Monthly */
function MonthlyCalendar({
  value,
  defaultValue,
  onValueChange,
  month,
  defaultMonth,
  onMonthChange,
  className,
  ...props
}: MonthlyCalendarProps) {
  const [innerValue, setInnerValue] = useState(defaultValue);
  const [innerMonth, setInnerMonth] = useState(() => startOfMonth(defaultMonth ?? defaultValue ?? new Date()));
  const selected = value ?? innerValue;
  const visibleMonth = month ? startOfMonth(month) : innerMonth;
  const weeks = buildWeeks(visibleMonth);
  const chevronSrc = assetSrc(chevronNext);
  const selectedSrc = assetSrc(selectedDay);

  function changeMonth(nextMonth: Date) {
    const normalized = startOfMonth(nextMonth);
    setInnerMonth(normalized);
    onMonthChange?.(normalized);
  }

  function selectDate(nextValue: Date) {
    setInnerValue(nextValue);
    onValueChange?.(nextValue);
  }

  function moveToday() {
    const today = new Date();
    const nextValue = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    selectDate(nextValue);
    changeMonth(nextValue);
  }

  return (
    <div className={cn('bg-bg-0 flex w-[350px] flex-col gap-x2', className)} {...props}>
      <div className='relative flex h-[46px] items-center'>
        <TodayButton onClick={moveToday} />
        <div className='absolute left-1/2 flex -translate-x-1/2 items-center gap-x3'>
          <button type='button' aria-label='이전 달' onClick={() => changeMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))} className='inline-flex items-center justify-center'>
            <img alt='' src={chevronSrc} width={7.5} height={13.5} className='rotate-180' />
          </button>
          <span className='body1-bold text-text-primary'>
            {visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월
          </span>
          <button type='button' aria-label='다음 달' onClick={() => changeMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))} className='inline-flex items-center justify-center'>
            <img alt='' src={chevronSrc} width={7.5} height={13.5} />
          </button>
        </div>
      </div>
      <div className='flex flex-col gap-x1'>
        <div className='flex h-8 items-center justify-between'>
          {WEEKDAYS.map((weekday, index) => (
            <span
              key={weekday}
              className={cn(
                'caption1-semibold flex h-8 w-[42px] items-center justify-center',
                index === 0 && 'text-text-accent',
                index === 6 && 'text-info',
                index !== 0 && index !== 6 && 'text-fill-secondary-500'
              )}
            >
              {weekday}
            </span>
          ))}
        </div>
        <div className='flex flex-col'>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className='flex h-[42px] items-center justify-between'>
              {week.map((date, dayIndex) => {
                if (!date) return <span key={`${weekIndex}-${dayIndex}`} className='size-[42px]' />;

                const isSelected = selected ? isSameDay(date, selected) : false;
                const isSunday = date.getDay() === 0;
                const isSaturday = date.getDay() === 6;

                return (
                  <button
                    key={date.toISOString()}
                    type='button'
                    aria-pressed={isSelected}
                    aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일`}
                    onClick={() => selectDate(date)}
                    className='relative size-[42px]'
                  >
                    {isSelected ? (
                      <img alt='' src={selectedSrc} width={34} height={34} className='absolute top-1 left-1' />
                    ) : null}
                    <span
                      className={cn(
                        'label-medium absolute inset-0 flex items-center justify-center',
                        isSelected && 'text-text-primary-inverse',
                        !isSelected && isSunday && 'text-text-accent',
                        !isSelected && isSaturday && 'text-info',
                        !isSelected && !isSunday && !isSaturday && 'text-text-primary'
                      )}
                    >
                      {date.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { MonthlyCalendar };
export type { MonthlyCalendarProps };
