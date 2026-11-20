import { formatKstTimeLabel } from '@shared/lib/calendar-date';

const KST_CLOCK_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/**
 * 시각을 한국 시간 24시간제 `HH:MM`으로 바꾼다. (예: 9시 5분 → `09:05`)
 * @param value ISO 시각 문자열
 */
function formatKstClock24(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return KST_CLOCK_FORMATTER.format(date);
}

/**
 * 예약 시간(`HH:mm`)을 그 날짜(KST)의 `오전 9:00` 형식으로 바꾼다. 시간이 비었거나 잘못되면 빈 문자열이다.
 * @param dateKey 날짜 키 `YYYY-MM-DD`
 * @param reservedTime 예약 시간 `HH:mm`
 */
function formatReservedTimeLabel(dateKey: string, reservedTime: string): string {
  const date = new Date(`${dateKey}T${reservedTime}:00+09:00`);
  if (!reservedTime || Number.isNaN(date.getTime())) return '';

  return formatKstTimeLabel(date);
}

export { formatKstClock24, formatReservedTimeLabel };
