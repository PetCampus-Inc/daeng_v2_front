'use client';

import { useMemo, useState } from 'react';

import { Divider, Icon } from '@knockdog/ui';

import { StoolStatusBadge } from '@shared/ui/stool-status';

import {
  ownerMemberProfileContent,
  type OwnerMemberAttendanceRecord,
} from '@views/owner/member-profile/config/ownerMemberProfileContent';
import {
  clampDate,
  formatDateKey,
  formatDayTitle,
  getEarliestDateKey,
  parseDateKey,
  startOfDay,
} from '@views/owner/member-profile/lib/attendanceCalendar';

import { AttendanceMonthlyCalendar } from './AttendanceMonthlyCalendar';
import { AttendanceWeeklyPicker } from './AttendanceWeeklyPicker';

interface AttendanceRecordSectionProps {
  records: OwnerMemberAttendanceRecord[];
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
  const today = useMemo(() => startOfDay(new Date()), []);
  const recordDateSet = useMemo(() => new Set(records.map((record) => record.date)), [records]);
  const earliestDateKey = useMemo(
    () => getEarliestDateKey(records.map((record) => record.date)),
    [records],
  );
  const minDate = useMemo(
    () => (earliestDateKey ? parseDateKey(earliestDateKey) : today),
    [earliestDateKey, today],
  );
  const maxDate = today;

  const [isMonthlyExpanded, setIsMonthlyExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() =>
    clampDate(parseDateKey('2026-06-08'), minDate, maxDate),
  );
  const [viewMonth, setViewMonth] = useState(() =>
    startOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)),
  );

  const selectedDateKey = formatDateKey(selectedDate);
  const selectedRecord = records.find((record) => record.date === selectedDateKey);

  const handleSelectDate = (date: Date) => {
    const nextDate = clampDate(date, minDate, maxDate);
    setSelectedDate(nextDate);
    setViewMonth(startOfDay(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1)));
  };

  const handleGoToday = () => {
    handleSelectDate(today);
  };

  const handleExpandMonthly = () => {
    setViewMonth(startOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)));
    setIsMonthlyExpanded(true);
  };

  return (
    <div className='flex flex-col items-center pb-5'>
      {isMonthlyExpanded ? (
        <AttendanceMonthlyCalendar
          selectedDate={selectedDate}
          viewMonth={viewMonth}
          today={today}
          recordDateSet={recordDateSet}
          minDate={minDate}
          maxDate={maxDate}
          onChangeViewMonth={setViewMonth}
          onSelectDate={handleSelectDate}
          onGoToday={handleGoToday}
          onCollapse={() => setIsMonthlyExpanded(false)}
        />
      ) : (
        <AttendanceWeeklyPicker
          selectedDate={selectedDate}
          recordDateSet={recordDateSet}
          minDate={minDate}
          maxDate={maxDate}
          onSelectDate={handleSelectDate}
          onExpandMonthly={handleExpandMonthly}
        />
      )}

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
