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

export { formatKstClock24 };
