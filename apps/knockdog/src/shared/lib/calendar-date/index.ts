const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return startOfDay(next);
}

function addMonths(date: Date, months: number) {
  const next = new Date(date.getFullYear(), date.getMonth() + months, 1);
  return startOfDay(next);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function isBeforeDay(a: Date, b: Date) {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

function isAfterDay(a: Date, b: Date) {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

function getWeekDates(anchorDate: Date) {
  const start = startOfDay(anchorDate);
  start.setDate(anchorDate.getDate() - anchorDate.getDay());

  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
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

function formatMonthTitle(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function hasSelectableDayInWeek(anchorDate: Date, minDate: Date, maxDate: Date) {
  return getWeekDates(anchorDate).some(
    (date) => !isBeforeDay(date, minDate) && !isAfterDay(date, maxDate),
  );
}

export {
  WEEKDAY_LABELS,
  addDays,
  addMonths,
  formatDateKey,
  formatMonthTitle,
  getMonthGridDates,
  getWeekDates,
  hasSelectableDayInWeek,
  isAfterDay,
  isBeforeDay,
  isSameDay,
  isSameMonth,
  startOfDay,
};
