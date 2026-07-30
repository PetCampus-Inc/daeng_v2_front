'use client';

import { useRef, type PointerEvent } from 'react';

import { Icon } from '@knockdog/ui';

import {
  WEEKDAY_LABELS,
  addMonths,
  formatDateKey,
  formatMonthTitle,
  getMonthGridDates,
  isAfterDay,
  isBeforeDay,
  isSameDay,
  isSameMonth,
  startOfDay,
} from '@shared/lib/calendar-date';

interface MonthlyDatePickerProps {
  selectedDate: Date;
  viewMonth: Date;
  today: Date;
  minDate: Date;
  maxDate: Date;
  /** `YYYY-MM-DD` 키. 해당 날짜에 마커(점) 표시 */
  markedDateKeys?: Set<string>;
  markerClassName?: string;
  todayButtonLabel?: string;
  collapseLabel?: string;
  onChangeViewMonth: (date: Date) => void;
  onSelectDate: (date: Date) => void;
  onGoToday: () => void;
  onCollapse: () => void;
}

const DEFAULT_MARKER_CLASS_NAME = 'bg-[#FF8A00]';
const DEFAULT_TODAY_BUTTON_LABEL = '오늘';
const DEFAULT_COLLAPSE_LABEL = '접기';

function MonthlyDatePicker({
  selectedDate,
  viewMonth,
  today,
  minDate,
  maxDate,
  markedDateKeys,
  markerClassName = DEFAULT_MARKER_CLASS_NAME,
  todayButtonLabel = DEFAULT_TODAY_BUTTON_LABEL,
  collapseLabel = DEFAULT_COLLAPSE_LABEL,
  onChangeViewMonth,
  onSelectDate,
  onGoToday,
  onCollapse,
}: MonthlyDatePickerProps) {
  const dragStartYRef = useRef<number | null>(null);
  const monthDates = getMonthGridDates(viewMonth);
  const minMonth = startOfDay(new Date(minDate.getFullYear(), minDate.getMonth(), 1));
  const maxMonth = startOfDay(new Date(maxDate.getFullYear(), maxDate.getMonth(), 1));
  const canGoPrevMonth = !isBeforeDay(addMonths(viewMonth, -1), minMonth);
  const canGoNextMonth = !isAfterDay(addMonths(viewMonth, 1), maxMonth);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    dragStartYRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragStartYRef.current == null) return;
    if (dragStartYRef.current - event.clientY >= 40) {
      dragStartYRef.current = null;
      onCollapse();
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    dragStartYRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className='flex w-full flex-col gap-0 pt-5'>
      <div className='flex w-full flex-col gap-4 rounded-b-[12px] px-4'>
        <div className='flex w-full items-center justify-between px-4'>
          <div className='flex items-center gap-2 py-1'>
            <button
              type='button'
              aria-label='이전 달'
              className='inline-flex size-6 items-center justify-center disabled:opacity-30'
              disabled={!canGoPrevMonth}
              onClick={() => onChangeViewMonth(addMonths(viewMonth, -1))}
            >
              <Icon icon='ChevronLeft' className='text-text-primary size-6' />
            </button>
            <h2 className='h3-extrabold text-text-primary'>{formatMonthTitle(viewMonth)}</h2>
            <button
              type='button'
              aria-label='다음 달'
              className='inline-flex size-6 items-center justify-center disabled:opacity-30'
              disabled={!canGoNextMonth}
              onClick={() => onChangeViewMonth(addMonths(viewMonth, 1))}
            >
              <Icon icon='ChevronRight' className='text-text-primary size-6' />
            </button>
          </div>

          <button
            type='button'
            className='bg-fill-secondary-500 caption1-semibold text-text-primary-inverse rounded-full px-2 py-1'
            onClick={onGoToday}
          >
            {todayButtonLabel}
          </button>
        </div>

        <div className='flex w-full flex-col gap-1 px-4 pb-0'>
          <div className='flex w-full items-center justify-between'>
            {WEEKDAY_LABELS.map((label, index) => (
              <div
                key={label}
                className='flex w-[33px] flex-col items-center justify-center py-0.5'
              >
                <span
                  className={`caption1-semibold ${
                    index === 0 ? 'text-[#dd5435]' : 'text-text-secondary'
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className='grid w-full grid-cols-7 justify-items-center gap-y-1'>
            {monthDates.map((date) => {
              const dateKey = formatDateKey(date);
              const inCurrentMonth = isSameMonth(date, viewMonth);
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today);
              const hasMarker = markedDateKeys?.has(dateKey) ?? false;
              const isDisabled =
                !inCurrentMonth || isBeforeDay(date, minDate) || isAfterDay(date, maxDate);

              return (
                <button
                  key={dateKey}
                  type='button'
                  disabled={isDisabled}
                  onClick={() => onSelectDate(date)}
                  className={`flex h-[38px] w-[30px] flex-col items-center justify-center gap-0.5 ${
                    !inCurrentMonth ? 'pointer-events-none opacity-0' : ''
                  } ${isSelected ? 'bg-fill-secondary-700 rounded-[8px]' : ''} ${
                    !isSelected && isToday ? 'bg-fill-secondary-500 rounded-[8px]' : ''
                  } ${isDisabled && inCurrentMonth ? 'opacity-30' : ''}`}
                >
                  <span
                    className={`body2-bold ${
                      isSelected || isToday ? 'text-text-primary-inverse' : 'text-text-secondary'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  <span
                    className={`size-1.5 rounded-full ${
                      hasMarker && inCurrentMonth ? markerClassName : 'bg-transparent'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className='flex w-full justify-center pt-4 pb-4'>
        <button
          type='button'
          aria-label='주간 캘린더로 접기'
          className='caption1-semibold text-text-tertiary underline underline-offset-2'
          onClick={onCollapse}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {collapseLabel}
        </button>
      </div>
    </div>
  );
}

export { MonthlyDatePicker };
export type { MonthlyDatePickerProps };
