import {
  WEEKDAY_LABELS,
  addDays,
  addMonths,
  formatDateKey,
  formatMonthTitle,
  getMonthGridDates,
  getWeekDates,
  isAfterDay,
  isBeforeDay,
  isSameDay,
  isSameMonth,
  startOfDay,
} from '@shared/lib/calendar-date';

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return startOfDay(new Date(year!, month! - 1, day));
}

function formatDayTitle(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY_LABELS[date.getDay()]})`;
}

function clampDate(date: Date, minDate: Date, maxDate: Date) {
  if (isBeforeDay(date, minDate)) return startOfDay(minDate);
  if (isAfterDay(date, maxDate)) return startOfDay(maxDate);
  return startOfDay(date);
}

function getEarliestDateKey(dateKeys: string[]) {
  if (dateKeys.length === 0) return null;
  return [...dateKeys].sort()[0] ?? null;
}

export {
  addDays,
  addMonths,
  clampDate,
  formatDateKey,
  formatDayTitle,
  formatMonthTitle,
  getEarliestDateKey,
  getMonthGridDates,
  getWeekDates,
  isAfterDay,
  isBeforeDay,
  isSameDay,
  isSameMonth,
  parseDateKey,
  startOfDay,
};
