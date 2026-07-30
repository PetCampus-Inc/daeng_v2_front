import {
  WEEKDAY_LABELS,
  addDays,
  formatDateKey,
  formatMonthTitle,
  getWeekDates,
  isAfterDay,
  isBeforeDay,
  isSameDay,
  startOfDay,
} from '@shared/ui/weekly-date-picker';

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return startOfDay(new Date(year!, month! - 1, day));
}

function addMonths(date: Date, months: number) {
  const next = new Date(date.getFullYear(), date.getMonth() + months, 1);
  return startOfDay(next);
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function getMonthGridDates(viewMonth: Date) {
  const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const lastOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());
  const gridEnd = addDays(lastOfMonth, 6 - lastOfMonth.getDay());
  const dayCount =
    Math.round((gridEnd.getTime() - gridStart.getTime()) / (24 * 60 * 60 * 1000)) + 1;

  return Array.from({ length: dayCount }, (_, index) => addDays(gridStart, index));
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
