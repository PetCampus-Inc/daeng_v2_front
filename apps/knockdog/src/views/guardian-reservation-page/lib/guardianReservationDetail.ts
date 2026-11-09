const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'] as const;

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function parseVisit(value: string) {
  const [datePart = '', timePart = '00:00'] = value.split('T');
  const [year = '0', month = '1', day = '1'] = datePart.split('-');
  const [hour = '0', minute = '0'] = timePart.split(':');
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
}

function toVisitKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function canCancelReservation(startsAt: string, now: Date) {
  return startsAt > toVisitKey(now);
}

function formatDetailDate(startsAt: string) {
  const date = parseVisit(startsAt);
  const weekday = WEEKDAY[date.getDay()] ?? '';
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekday})`;
}

function formatDetailClock(startsAt: string) {
  const date = parseVisit(startsAt);
  const hour = date.getHours();
  const period = hour < 12 ? '오전' : '오후';
  const hour12 = hour % 12 || 12;
  return `${period} ${hour12}:${pad(date.getMinutes())}`;
}

function formatCancelWhen(startsAt: string) {
  const date = parseVisit(startsAt);
  const hour = date.getHours();
  const period = hour < 12 ? '오전' : '오후';
  const hour12 = hour % 12 || 12;
  return `${formatDetailDate(startsAt)} ${period} ${pad(hour12)}:${pad(date.getMinutes())}`;
}

function formatDeadlineLead(startsAt: string) {
  return `${formatDetailDate(startsAt)} ${formatDetailClock(startsAt)}까지 `;
}

export { canCancelReservation, formatCancelWhen, formatDeadlineLead, formatDetailClock, formatDetailDate };
