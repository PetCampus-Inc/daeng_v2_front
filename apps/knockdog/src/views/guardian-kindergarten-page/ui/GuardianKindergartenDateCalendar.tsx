'use client';

import { useMemo, useState } from 'react';

import { isAfterDay, startOfDay } from '@shared/lib/calendar-date';
import { MonthlyDatePicker } from '@shared/ui/monthly-date-picker';
import { WeeklyDatePicker } from '@shared/ui/weekly-date-picker';

interface GuardianKindergartenDateCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  /** `YYYY-MM-DD` — 해당 날짜에 마커 표시 */
  markedDateKeys?: Set<string>;
}

function GuardianKindergartenDateCalendar({
  selectedDate,
  onSelectDate,
  markedDateKeys,
}: GuardianKindergartenDateCalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const minDate = useMemo(() => startOfDay(new Date(2020, 0, 1)), []);
  const maxDate = today;

  const [isMonthlyExpanded, setIsMonthlyExpanded] = useState(false);
  const [viewMonth, setViewMonth] = useState(() =>
    startOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
  );

  const handleSelectDate = (date: Date) => {
    const clamped = isAfterDay(date, maxDate) ? maxDate : startOfDay(date);
    onSelectDate(clamped);
    setViewMonth(startOfDay(new Date(clamped.getFullYear(), clamped.getMonth(), 1)));
  };

  const handleExpandMonthly = () => {
    setViewMonth(startOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)));
    setIsMonthlyExpanded(true);
  };

  const handleGoToday = () => {
    handleSelectDate(today);
  };

  if (isMonthlyExpanded) {
    return (
      <MonthlyDatePicker
        selectedDate={selectedDate}
        viewMonth={viewMonth}
        today={today}
        minDate={minDate}
        maxDate={maxDate}
        markedDateKeys={markedDateKeys}
        todayButtonLabel='오늘'
        onChangeViewMonth={setViewMonth}
        onSelectDate={handleSelectDate}
        onGoToday={handleGoToday}
        onCollapse={() => setIsMonthlyExpanded(false)}
      />
    );
  }

  return (
    <WeeklyDatePicker
      selectedDate={selectedDate}
      minDate={minDate}
      maxDate={maxDate}
      markedDateKeys={markedDateKeys}
      onSelectDate={handleSelectDate}
      onExpandMonthly={handleExpandMonthly}
    />
  );
}

export { GuardianKindergartenDateCalendar };
