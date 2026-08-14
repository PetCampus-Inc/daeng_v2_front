import { getKstDateParts } from '@shared/lib/calendar-date';

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function getKstClockParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  return {
    hour: Number(parts.find((part) => part.type === 'hour')?.value),
    minute: Number(parts.find((part) => part.type === 'minute')?.value),
  };
}

/** KST `HH:mm` */
function formatNoticeClockTime(date: Date) {
  const { hour, minute } = getKstClockParts(date);
  return `${pad2(hour)}:${pad2(minute)}`;
}

/** `2026. 07. 08. 18:59 수정` */
function formatNoticeUpdatedAt(date: Date, suffix: string) {
  const { year, month, day } = getKstDateParts(date);
  const { hour, minute } = getKstClockParts(date);
  return `${year}. ${pad2(month)}. ${pad2(day)}. ${pad2(hour)}:${pad2(minute)} ${suffix}`;
}

function parseDateQuery(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  // JS Date는 범위 밖 day/month를 정규화하므로 원본 구성요소와 일치할 때만 유효
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

export { formatNoticeClockTime, formatNoticeUpdatedAt, parseDateQuery };
