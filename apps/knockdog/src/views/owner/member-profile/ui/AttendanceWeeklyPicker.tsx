'use client';

import { WeeklyDatePicker } from '@shared/ui/weekly-date-picker';

interface AttendanceWeeklyPickerProps {
  selectedDate: Date;
  recordDateSet: Set<string>;
  minDate: Date;
  maxDate: Date;
  onSelectDate: (date: Date) => void;
  onExpandMonthly: () => void;
}

function AttendanceWeeklyPicker({
  selectedDate,
  recordDateSet,
  minDate,
  maxDate,
  onSelectDate,
  onExpandMonthly,
}: AttendanceWeeklyPickerProps) {
  return (
    <WeeklyDatePicker
      selectedDate={selectedDate}
      minDate={minDate}
      maxDate={maxDate}
      markedDateKeys={recordDateSet}
      onSelectDate={onSelectDate}
      onExpandMonthly={onExpandMonthly}
    />
  );
}

export { AttendanceWeeklyPicker };
