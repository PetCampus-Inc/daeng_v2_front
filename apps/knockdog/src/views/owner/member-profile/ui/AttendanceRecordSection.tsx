'use client';

import { useMemo, useState } from 'react';

import { Divider, Icon } from '@knockdog/ui';

import {
  type AttendanceRecord,
  type AttendanceRecordCondition,
  useAttendanceRecordDatesQuery,
  useAttendanceRecordQuery,
} from '@entities/owner-attendance-record';

import { StoolStatusBadge } from '@shared/ui/stool-status';

import { ownerMemberProfileContent } from '@views/owner/member-profile/config/ownerMemberProfileContent';
import {
  formatDateKey,
  formatDayTitle,
  getMonthGridDates,
  getWeekDates,
  isAfterDay,
  startOfDay,
} from '@views/owner/member-profile/lib/attendanceCalendar';

import { AttendanceMonthlyCalendar } from './AttendanceMonthlyCalendar';
import { AttendanceWeeklyPicker } from './AttendanceWeeklyPicker';

const CONDITION_LABELS: Record<AttendanceRecordCondition, string> = {
  ENERGETIC: '활력 넘치게 지냈어요',
  USUAL: '평소와 비슷했어요',
  RESTED: '차분히 휴식했어요',
  WATCH_AFTER_RETURN: '귀가 후 확인이 필요해요',
};

interface AttendanceRecordSectionProps {
  petId: string;
}

interface AttendanceDayCardProps {
  date: Date;
  record: AttendanceRecord;
}

const EMPTY_VALUE = '없음';

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
          <span className='body2-bold text-text-secondary'>{record.checkIn || EMPTY_VALUE}</span>
        </div>
        <div className='bg-bg-50 radius-r2 flex flex-1 flex-col justify-center gap-1 px-4 py-2'>
          <div className='flex items-center gap-0.5'>
            <Icon icon='Time' className='text-text-tertiary size-4' />
            <span className='caption1-semibold text-text-tertiary'>
              {ownerMemberProfileContent.checkOutLabel}
            </span>
          </div>
          <span className='body2-bold text-text-secondary'>{record.checkOut || EMPTY_VALUE}</span>
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <span className='body2-regular text-text-secondary'>
            {ownerMemberProfileContent.conditionLabel}
          </span>
          <p className='body1-medium text-text-primary'>
            {record.condition ? (CONDITION_LABELS[record.condition] ?? record.condition) : EMPTY_VALUE}
          </p>
        </div>

        <Divider />

        <div className='flex flex-col gap-2'>
          <span className='body2-regular text-text-secondary'>
            {ownerMemberProfileContent.snackLabel}
          </span>
          <p className='body1-medium text-text-primary whitespace-pre-wrap'>
            {record.snack || EMPTY_VALUE}
          </p>
        </div>

        <Divider />

        <div className='flex flex-col gap-2'>
          <span className='body2-regular text-text-secondary'>
            {ownerMemberProfileContent.stoolStatusLabel}
          </span>
          {record.poop ? <StoolStatusBadge status={record.poop} /> : (
            <p className='body1-medium text-text-primary'>{EMPTY_VALUE}</p>
          )}
        </div>

        {record.note && (
          <>
            <Divider />
            <p className='body1-medium text-text-primary whitespace-pre-wrap'>{record.note}</p>
          </>
        )}
      </div>
    </div>
  );
}

/** 화면에 실제로 보이는 날짜 범위 — 월 경계 주/그리드의 인접 달 날짜 포함 */
function getVisibleRecordDateRange(options: {
  isMonthlyExpanded: boolean;
  selectedDate: Date;
  viewMonth: Date;
}) {
  if (options.isMonthlyExpanded) {
    const grid = getMonthGridDates(options.viewMonth);
    return {
      from: formatDateKey(grid[0]!),
      to: formatDateKey(grid[grid.length - 1]!),
    };
  }

  const week = getWeekDates(options.selectedDate);
  return {
    from: formatDateKey(week[0]!),
    to: formatDateKey(week[week.length - 1]!),
  };
}

function AttendanceRecordSection({ petId }: AttendanceRecordSectionProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [isMonthlyExpanded, setIsMonthlyExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => today);
  const [viewMonth, setViewMonth] = useState(() =>
    startOfDay(new Date(today.getFullYear(), today.getMonth(), 1)),
  );

  const selectedDateKey = formatDateKey(selectedDate);
  const { from, to } = useMemo(
    () =>
      getVisibleRecordDateRange({
        isMonthlyExpanded,
        selectedDate,
        viewMonth,
      }),
    [isMonthlyExpanded, selectedDate, viewMonth],
  );

  const { data: recordDateSet } = useAttendanceRecordDatesQuery({
    petId,
    from,
    to,
    enabled: Boolean(petId),
  });

  const { data: selectedRecord } = useAttendanceRecordQuery({
    petId,
    date: selectedDateKey,
    enabled: Boolean(petId),
  });

  const safeDateSet = useMemo(() => {
    const base = new Set(recordDateSet ?? []);
    // record.date LocalDate/오늘 fallback 방지
    if (selectedRecord) base.add(selectedDateKey);
    return base;
  }, [recordDateSet, selectedRecord, selectedDateKey]);
  const minDate = useMemo(() => startOfDay(new Date(2020, 0, 1)), []);
  const maxDate = today;

  const handleSelectDate = (date: Date) => {
    const clamped = isAfterDay(date, maxDate) ? maxDate : startOfDay(date);
    setSelectedDate(clamped);
    setViewMonth(startOfDay(new Date(clamped.getFullYear(), clamped.getMonth(), 1)));
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
          recordDateSet={safeDateSet}
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
          recordDateSet={safeDateSet}
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
