'use client';

import { useRef, type PointerEvent } from 'react';

import { Icon } from '@knockdog/ui';

import {
  WEEKDAY_LABELS,
  ownerMemberProfileContent,
} from '@views/owner/member-profile/config/ownerMemberProfileContent';
import {
  addMonths,
  formatDateKey,
  formatMonthTitle,
  getMonthGridDates,
  isAfterDay,
  isBeforeDay,
  isSameDay,
  isSameMonth,
  startOfDay,
} from '@views/owner/member-profile/lib/attendanceCalendar';

interface AttendanceMonthlyCalendarProps {
  selectedDate: Date;
  viewMonth: Date;
  today: Date;
  recordDateSet: Set<string>;
  minDate: Date;
  maxDate: Date;
  onChangeViewMonth: (date: Date) => void;
  onSelectDate: (date: Date) => void;
  onGoToday: () => void;
  onCollapse: () => void;
}

function AttendanceMonthlyCalendar({
  selectedDate,
  viewMonth,
  today,
  recordDateSet,
  minDate,
  maxDate,
  onChangeViewMonth,
  onSelectDate,
  onGoToday,
  onCollapse,
}: AttendanceMonthlyCalendarProps) {
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
            {ownerMemberProfileContent.todayButtonLabel}
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
              const hasRecord = recordDateSet.has(dateKey);
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
                      hasRecord && inCurrentMonth ? 'bg-text-accent' : 'bg-transparent'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className='flex w-full justify-center pb-4'>
        <button
          type='button'
          aria-label='주간 캘린더로 접기'
          className='flex w-full items-center justify-center py-1'
          onClick={onCollapse}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <span className='bg-fill-secondary-200 h-1 w-9 rounded-full' />
        </button>
      </div>
    </div>
  );
}

export { AttendanceMonthlyCalendar };
