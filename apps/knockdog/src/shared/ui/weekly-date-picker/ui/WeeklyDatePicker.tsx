'use client';

import { Calendar } from '@knockdog/icons';
import { Icon } from '@knockdog/ui';

import { WEEKDAY_LABELS } from '../config/weekdayLabels';
import {
  addDays,
  formatDateKey,
  formatMonthTitle,
  getWeekDates,
  hasSelectableDayInWeek,
  isAfterDay,
  isBeforeDay,
  isSameDay,
} from '../lib/calendarDate';

interface WeeklyDatePickerProps {
  selectedDate: Date;
  minDate: Date;
  maxDate: Date;
  /** `YYYY-MM-DD` 키. 해당 날짜에 마커(점) 표시 */
  markedDateKeys?: Set<string>;
  markerClassName?: string;
  onSelectDate: (date: Date) => void;
  /** 전달 시 월 타이틀 옆 캘린더 아이콘 표시 */
  onExpandMonthly?: () => void;
}

const DEFAULT_MARKER_CLASS_NAME = 'bg-[#FF8A00]';

function WeeklyDatePicker({
  selectedDate,
  minDate,
  maxDate,
  markedDateKeys,
  markerClassName = DEFAULT_MARKER_CLASS_NAME,
  onSelectDate,
  onExpandMonthly,
}: WeeklyDatePickerProps) {
  const weekDates = getWeekDates(selectedDate);
  const canGoPrev = hasSelectableDayInWeek(addDays(selectedDate, -7), minDate, maxDate);
  const canGoNext = hasSelectableDayInWeek(addDays(selectedDate, 7), minDate, maxDate);

  return (
    <div className='flex w-full flex-col items-center gap-4 px-4 py-5'>
      <div className='flex items-center justify-center gap-1'>
        <h2 className='h3-extrabold text-text-primary'>{formatMonthTitle(selectedDate)}</h2>
        {onExpandMonthly ? (
          <button
            type='button'
            aria-label='월간 캘린더 열기'
            className='inline-flex size-6 items-center justify-center'
            onClick={onExpandMonthly}
          >
            <Calendar className='text-text-primary size-6' />
          </button>
        ) : null}
      </div>

      <div className='flex w-full items-center justify-between'>
        <button
          type='button'
          aria-label='이전 주'
          className='inline-flex size-6 shrink-0 items-center justify-center disabled:opacity-30'
          disabled={!canGoPrev}
          onClick={() => onSelectDate(addDays(selectedDate, -7))}
        >
          <Icon icon='ChevronLeft' className='text-text-primary size-6' />
        </button>

        <div className='flex items-center'>
          {weekDates.map((date) => {
            const dateKey = formatDateKey(date);
            const isSelected = isSameDay(date, selectedDate);
            const hasMarker = markedDateKeys?.has(dateKey) ?? false;
            const isDisabled = isBeforeDay(date, minDate) || isAfterDay(date, maxDate);

            return (
              <button
                key={dateKey}
                type='button'
                disabled={isDisabled}
                onClick={() => onSelectDate(date)}
                className={`flex w-[41px] flex-col items-center px-3 py-1.5 disabled:opacity-30 ${
                  isSelected ? 'bg-fill-secondary-700 radius-r2' : ''
                }`}
              >
                <span
                  className={`caption1-semibold ${
                    isSelected ? 'text-text-primary-inverse' : 'text-text-secondary'
                  }`}
                >
                  {WEEKDAY_LABELS[date.getDay()]}
                </span>
                <span
                  className={`body1-bold ${
                    isSelected ? 'text-text-primary-inverse' : 'text-text-secondary'
                  }`}
                >
                  {date.getDate()}
                </span>
                <span
                  className={`size-1.5 rounded-full ${
                    hasMarker ? markerClassName : 'bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>

        <button
          type='button'
          aria-label='다음 주'
          className='inline-flex size-6 shrink-0 items-center justify-center disabled:opacity-30'
          disabled={!canGoNext}
          onClick={() => onSelectDate(addDays(selectedDate, 7))}
        >
          <Icon icon='ChevronRight' className='text-text-primary size-6' />
        </button>
      </div>
    </div>
  );
}

export { WeeklyDatePicker };
export type { WeeklyDatePickerProps };
