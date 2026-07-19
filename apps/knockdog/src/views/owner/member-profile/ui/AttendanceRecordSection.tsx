'use client';

import { useMemo, useState } from 'react';
import { Divider, Icon } from '@knockdog/ui';

import { StoolStatusBadge } from '@shared/ui/stool-status';

import {
  WEEKDAY_LABELS,
  ownerMemberProfileContent,
  type OwnerMemberAttendanceRecord,
} from '../config/ownerMemberProfileContent';

interface AttendanceRecordSectionProps {
  records: OwnerMemberAttendanceRecord[];
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year!, month! - 1, day);
}

function getWeekDates(anchorDate: Date) {
  const start = new Date(anchorDate);
  start.setDate(anchorDate.getDate() - anchorDate.getDay());
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function formatMonthTitle(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function formatDayTitle(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY_LABELS[date.getDay()]})`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

interface AttendanceDayCardProps {
  date: Date;
  record: OwnerMemberAttendanceRecord;
}

function AttendanceDayCard({ date, record }: AttendanceDayCardProps) {
  return (
    <div className='bg-bg-0 radius-r3 flex w-full flex-col gap-4 px-4 py-5'>
      <h3 className='body1-extrabold text-text-primary'>{formatDayTitle(date)}</h3>

      <div className='gap-x2 flex items-stretch'>
        <div className='bg-bg-50 radius-r2 flex flex-1 flex-col gap-1 px-4 py-2'>
          <div className='flex items-center gap-0.5'>
            <Icon icon='Time' className='text-text-tertiary size-4' />
            <span className='caption1-semibold text-text-tertiary'>
              {ownerMemberProfileContent.checkInLabel}
            </span>
          </div>
          <span className='body2-bold text-text-secondary'>{record.checkIn}</span>
        </div>
        <div className='bg-bg-50 radius-r2 flex flex-1 flex-col justify-center gap-1 px-4 py-2'>
          <div className='flex items-center gap-0.5'>
            <Icon icon='Time' className='text-text-tertiary size-4' />
            <span className='caption1-semibold text-text-tertiary'>
              {ownerMemberProfileContent.checkOutLabel}
            </span>
          </div>
          <span className='body2-bold text-text-secondary'>{record.checkOut}</span>
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <span className='body2-regular text-text-secondary'>
            {ownerMemberProfileContent.conditionLabel}
          </span>
          <p className='body1-medium text-text-primary'>{record.condition}</p>
        </div>

        <Divider />

        <div className='flex flex-col gap-2'>
          <span className='body2-regular text-text-secondary'>
            {ownerMemberProfileContent.snackLabel}
          </span>
          <p className='body1-medium text-text-primary'>{record.snack}</p>
        </div>

        <Divider />

        <div className='flex flex-col gap-2'>
          <span className='body2-regular text-text-secondary'>
            {ownerMemberProfileContent.stoolStatusLabel}
          </span>
          <StoolStatusBadge status={record.stoolStatus} />
        </div>

        <Divider />

        <p className='body1-medium text-text-primary'>{record.note}</p>
      </div>
    </div>
  );
}

function AttendanceRecordSection({ records }: AttendanceRecordSectionProps) {
  const recordDateSet = useMemo(() => new Set(records.map((record) => record.date)), [records]);
  const [selectedDate, setSelectedDate] = useState(() => parseDateKey('2026-06-08'));

  const weekDates = getWeekDates(selectedDate);
  const selectedDateKey = formatDateKey(selectedDate);
  const selectedRecord = records.find((record) => record.date === selectedDateKey);

  const handlePrevWeek = () => {
    setSelectedDate((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setSelectedDate((prev) => addDays(prev, 7));
  };

  return (
    <div className='flex flex-col items-center pb-5'>
      <div className='flex w-full flex-col items-center gap-4 px-4 py-5'>
        <div className='flex items-center justify-center gap-1'>
          <h2 className='h3-extrabold text-text-primary'>{formatMonthTitle(selectedDate)}</h2>
          <button
            type='button'
            aria-label='월 선택'
            className='inline-flex size-6 items-center justify-center'
          >
            <Icon icon='Calendar' className='text-text-primary size-6' />
          </button>
        </div>

        <div className='flex w-full items-center justify-between'>
          <button
            type='button'
            aria-label='이전 주'
            className='inline-flex size-6 shrink-0 items-center justify-center'
            onClick={handlePrevWeek}
          >
            <Icon icon='ChevronLeft' className='text-text-primary size-6' />
          </button>

          <div className='flex items-center'>
            {weekDates.map((date) => {
              const dateKey = formatDateKey(date);
              const isSelected = dateKey === selectedDateKey;
              const hasRecord = recordDateSet.has(dateKey);

              return (
                <button
                  key={dateKey}
                  type='button'
                  onClick={() => setSelectedDate(date)}
                  className={`flex w-[41px] flex-col items-center px-3 py-1.5 ${
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
                    className={`size-1 rounded-full ${hasRecord ? 'bg-text-accent' : 'bg-transparent'}`}
                  />
                </button>
              );
            })}
          </div>

          <button
            type='button'
            aria-label='다음 주'
            className='inline-flex size-6 shrink-0 items-center justify-center'
            onClick={handleNextWeek}
          >
            <Icon icon='ChevronRight' className='text-text-primary size-6' />
          </button>
        </div>
      </div>

      <div className='w-full px-4'>
        {selectedRecord ? (
          <AttendanceDayCard date={selectedDate} record={selectedRecord} />
        ) : (
          <div className='bg-bg-0 radius-r3 flex w-full flex-col gap-4 px-4 py-5'>
            <h3 className='body1-extrabold text-text-primary'>{formatDayTitle(selectedDate)}</h3>
            <p className='body1-medium text-text-tertiary'>
              {ownerMemberProfileContent.attendanceEmptyText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export { AttendanceRecordSection };
