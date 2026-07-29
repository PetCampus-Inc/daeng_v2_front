'use client';

import { Icon } from '@knockdog/ui';

import { WEEKDAY_LABELS } from '@views/owner/member-profile/config/ownerMemberProfileContent';
import {
  addDays,
  formatDateKey,
  formatMonthTitle,
  getWeekDates,
  isAfterDay,
  isBeforeDay,
  isSameDay,
} from '@views/owner/member-profile/lib/attendanceCalendar';

interface AttendanceWeeklyPickerProps {
  selectedDate: Date;
  recordDateSet: Set<string>;
  minDate: Date;
  maxDate: Date;
  onSelectDate: (date: Date) => void;
  onExpandMonthly: () => void;
}

function hasSelectableDayInWeek(anchorDate: Date, minDate: Date, maxDate: Date) {
  return getWeekDates(anchorDate).some(
    (date) => !isBeforeDay(date, minDate) && !isAfterDay(date, maxDate),
  );
}

function AttendanceWeeklyPicker({
  selectedDate,
  recordDateSet,
  minDate,
  maxDate,
  onSelectDate,
  onExpandMonthly,
}: AttendanceWeeklyPickerProps) {
  const weekDates = getWeekDates(selectedDate);
  const canGoPrev = hasSelectableDayInWeek(addDays(selectedDate, -7), minDate, maxDate);
  const canGoNext = hasSelectableDayInWeek(addDays(selectedDate, 7), minDate, maxDate);

  return (
    <div className='flex w-full flex-col items-center gap-4 px-4 py-5'>
      <div className='flex items-center justify-center gap-1'>
        <h2 className='h3-extrabold text-text-primary'>{formatMonthTitle(selectedDate)}</h2>
        <button
          type='button'
          aria-label='월간 캘린더 열기'
          className='inline-flex size-6 items-center justify-center'
          onClick={onExpandMonthly}
        >
          <Icon icon='Calendar' className='text-text-primary size-6' />
        </button>
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
            const hasRecord = recordDateSet.has(dateKey);
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
                  className={`size-1.5 rounded-full ${hasRecord ? 'bg-[#FF8A00]' : 'bg-transparent'}`}
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

export { AttendanceWeeklyPicker };
