'use client';

import { MonthlyDatePicker } from '@shared/ui/monthly-date-picker';

import { ownerMemberProfileContent } from '@views/owner/member-profile/config/ownerMemberProfileContent';

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
  return (
    <MonthlyDatePicker
      selectedDate={selectedDate}
      viewMonth={viewMonth}
      today={today}
      minDate={minDate}
      maxDate={maxDate}
      markedDateKeys={recordDateSet}
      todayButtonLabel={ownerMemberProfileContent.todayButtonLabel}
      onChangeViewMonth={onChangeViewMonth}
      onSelectDate={onSelectDate}
      onGoToday={onGoToday}
      onCollapse={onCollapse}
    />
  );
}

export { AttendanceMonthlyCalendar };
