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

function getNumberPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return Number(parts.find((part) => part.type === type)?.value);
}

function getKstDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: KST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  return {
    year: getNumberPart(parts, 'year'),
    month: getNumberPart(parts, 'month'),
    day: getNumberPart(parts, 'day'),
  };
}

function getKstTimeParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: KST_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

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

export { formatKstDateLabel, formatKstDayLabel, formatKstTimeLabel, getKstDateKey };
