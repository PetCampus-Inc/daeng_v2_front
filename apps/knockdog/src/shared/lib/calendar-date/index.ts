const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

const KST_TIME_ZONE = 'Asia/Seoul';

const KST_DATE_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  timeZone: KST_TIME_ZONE,
  month: 'long',
  day: 'numeric',
});

const KST_WEEKDAY_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  timeZone: KST_TIME_ZONE,
  weekday: 'short',
});

const KST_DATE_PARTS_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: KST_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const KST_TIME_PARTS_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: KST_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function getNumberPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return Number(parts.find((part) => part.type === type)?.value);
}

function getKstDateParts(date: Date) {
  const parts = KST_DATE_PARTS_FORMATTER.formatToParts(date);

  return {
    year: getNumberPart(parts, 'year'),
    month: getNumberPart(parts, 'month'),
    day: getNumberPart(parts, 'day'),
  };
}

function getKstTimeParts(date: Date) {
  const parts = KST_TIME_PARTS_FORMATTER.formatToParts(date);

  return {
    hour: getNumberPart(parts, 'hour'),
    minute: getNumberPart(parts, 'minute'),
  };
}

function getKstDateKey(date: Date) {
  const { year, month, day } = getKstDateParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatKstDateLabel(date: Date) {
  return KST_DATE_FORMATTER.format(date).replace(/\s/g, ' ');
}

function formatKstDayLabel(date: Date) {
  return `(${KST_WEEKDAY_FORMATTER.format(date)})`;
}

function formatKstTimeLabel(date: Date) {
  const { hour, minute } = getKstTimeParts(date);
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 || 12;
  const displayMinute = String(minute).padStart(2, '0');
  return `${period} ${displayHour}:${displayMinute}`;
}

/** 다음 KST 자정까지 남은 ms — 일과 날짜 롤오버용 */
function getNextKstMidnightDelay(now = new Date()) {
  const { year, month, day } = getKstDateParts(now);
  const nextKstMidnight = Date.UTC(year, month - 1, day + 1, -9);
  return Math.max(nextKstMidnight - now.getTime(), 0);
}

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

function hasSelectableDayInWeek(
  anchorDate: Date,
  minDate: Date,
  maxDate: Date,
  enabledDateKeys?: Set<string>
) {
  return getWeekDates(anchorDate).some((date) => {
    if (isBeforeDay(date, minDate) || isAfterDay(date, maxDate)) return false;
    if (enabledDateKeys != null && !enabledDateKeys.has(formatDateKey(date))) return false;
    return true;
  });
}

/** min/max(+enabled) 안에서 선택 가능한 날짜로 보정. enabled null이면 min/max만 적용 */
function resolveSelectableDate(
  date: Date,
  minDate: Date,
  maxDate: Date,
  enabledDateKeys?: Set<string>
) {
  let next = startOfDay(date);
  if (isBeforeDay(next, minDate)) next = startOfDay(minDate);
  if (isAfterDay(next, maxDate)) next = startOfDay(maxDate);

  if (enabledDateKeys == null || enabledDateKeys.size === 0) return next;
  if (enabledDateKeys.has(formatDateKey(next))) return next;

  const enabledDates = [...enabledDateKeys]
    .map((key) => {
      const [yearPart, monthPart, dayPart] = key.split('-');
      return startOfDay(new Date(Number(yearPart), Number(monthPart) - 1, Number(dayPart)));
    })
    .filter((item) => !isBeforeDay(item, minDate) && !isAfterDay(item, maxDate))
    .sort((a, b) => b.getTime() - a.getTime());

  return enabledDates[0] ?? next;
}

function pickSelectableDateInWeek(
  anchorDate: Date,
  preferredDate: Date,
  minDate: Date,
  maxDate: Date,
  enabledDateKeys?: Set<string>
) {
  const weekDates = getWeekDates(anchorDate);
  const isSelectable = (date: Date) => {
    if (isBeforeDay(date, minDate) || isAfterDay(date, maxDate)) return false;
    if (enabledDateKeys != null && !enabledDateKeys.has(formatDateKey(date))) return false;
    return true;
  };

  const sameWeekday = weekDates.find(
    (date) => date.getDay() === preferredDate.getDay() && isSelectable(date)
  );
  if (sameWeekday) return sameWeekday;

  const selectable = weekDates.filter(isSelectable);
  return selectable[selectable.length - 1] ?? selectable[0] ?? preferredDate;
}

export {
  WEEKDAY_LABELS,
  addDays,
  addMonths,
  formatDateKey,
  formatKstDateLabel,
  formatKstDayLabel,
  formatKstTimeLabel,
  formatMonthTitle,
  getKstDateKey,
  getKstDateParts,
  getMonthGridDates,
  getNextKstMidnightDelay,
  getWeekDates,
  hasSelectableDayInWeek,
  isAfterDay,
  isBeforeDay,
  isSameDay,
  isSameMonth,
  pickSelectableDateInWeek,
  resolveSelectableDate,
  startOfDay,
};
