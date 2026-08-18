'use client';

import { Calendar } from '@knockdog/icons';
import { Icon } from '@knockdog/ui';

import {
  WEEKDAY_LABELS,
  addDays,
  formatDateKey,
  formatMonthTitle,
  getWeekDates,
  hasSelectableDayInWeek,
  isAfterDay,
  isBeforeDay,
  isSameDay,
  pickSelectableDateInWeek,
} from '@shared/lib/calendar-date';

interface WeeklyDatePickerProps {
  selectedDate: Date;
  minDate: Date;
  maxDate: Date;
  /** `YYYY-MM-DD` 키. 해당 날짜에 마커(점) 표시 */
  markedDateKeys?: Set<string>;
  /**
   * 선택 가능한 날짜 키. 전달 시 포함되지 않은 날짜는 비활성(min/max와 함께 적용).
   * 미전달 시 min/max만으로 활성 여부 판단.
   */
  enabledDateKeys?: Set<string>;
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
  enabledDateKeys,
  markerClassName = DEFAULT_MARKER_CLASS_NAME,
  onSelectDate,
  onExpandMonthly,
}: WeeklyDatePickerProps) {
  const weekDates = getWeekDates(selectedDate);
  // 주 이동은 min/max만 본다. enabledDateKeys는 현재 주 조회 결과라 인접 주 판별에 쓰면 안 됨.
  const canGoPrev = hasSelectableDayInWeek(addDays(selectedDate, -7), minDate, maxDate);
  const canGoNext = hasSelectableDayInWeek(addDays(selectedDate, 7), minDate, maxDate);

  const handleMoveWeek = (weekOffset: number) => {
    const anchor = addDays(selectedDate, weekOffset * 7);
    onSelectDate(pickSelectableDateInWeek(anchor, selectedDate, minDate, maxDate));
  };

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
          onClick={() => handleMoveWeek(-1)}
        >
          <Icon icon='ChevronLeft' className='text-text-primary size-6' />
        </button>

        <div className='flex items-center'>
          {weekDates.map((date) => {
            const dateKey = formatDateKey(date);
            const hasMarker = markedDateKeys?.has(dateKey) ?? false;
            const isOutOfRange = isBeforeDay(date, minDate) || isAfterDay(date, maxDate);
            const isNotEnabled = enabledDateKeys != null && !enabledDateKeys.has(dateKey);
            const isDisabled = isOutOfRange || isNotEnabled;
            // 비활성 날짜는 선택 하이라이트도 없음 (주 전체 미등원 등)
            const isSelected = isSameDay(date, selectedDate) && !isDisabled;

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
          onClick={() => handleMoveWeek(1)}
        >
          <Icon icon='ChevronRight' className='text-text-primary size-6' />
        </button>
      </div>
    </div>
  );
}

export { WeeklyDatePicker };
export type { WeeklyDatePickerProps };
