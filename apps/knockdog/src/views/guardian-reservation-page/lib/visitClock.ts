import { WEEKDAY_LABELS } from '@shared/lib/calendar-date';

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function parseVisitKey(value: string) {
  const [datePart = '', timePart = '00:00'] = value.split('T');
  const [year = '0', month = '1', day = '1'] = datePart.split('-');
  const [hour = '0', minute = '0'] = timePart.split(':');
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
}

function toVisitKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatVisitDate(date: Date) {
  const weekday = WEEKDAY_LABELS[date.getDay()] ?? '';
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekday})`;
}

function formatHourClock(hour: number, minute: number, isHourPadded: boolean) {
  const hour12 = hour % 12 || 12;
  const hourLabel = isHourPadded ? pad2(hour12) : String(hour12);
  return `${hour < 12 ? '오전' : '오후'} ${hourLabel}:${pad2(minute)}`;
}

export { formatHourClock, formatVisitDate, parseVisitKey, toVisitKey };
