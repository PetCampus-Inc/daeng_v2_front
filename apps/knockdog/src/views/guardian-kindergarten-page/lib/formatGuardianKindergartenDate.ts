const WEEKDAY_SHORT = ['일', '월', '화', '수', '목', '금', '토'] as const;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** 해당 날짜가 속한 주의 일요일 */
function startOfWeek(date: Date) {
  return addDays(startOfDay(date), -date.getDay());
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

function formatKoreanDateWithWeekday(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY_SHORT[date.getDay()]})`;
}

function formatKoreanYearMonth(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function getWeekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

export {
  WEEKDAY_SHORT,
  addDays,
  formatKoreanDateWithWeekday,
  formatKoreanYearMonth,
  getWeekDays,
  isSameDay,
  startOfDay,
  startOfWeek,
};
