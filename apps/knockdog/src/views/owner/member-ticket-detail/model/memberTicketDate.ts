const DAY_MS = 86_400_000;

function startOfTicketDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatTicketDotDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}.${month}.${day}`;
}

function formatTicketSelectLabel(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function dotDateUtc(value: string) {
  const [year = 0, month = 1, day = 1] = value.split('.').map(Number);
  return Date.UTC(year, month - 1, day);
}

function daysBetweenDotDates(earlier: string, later: string) {
  return (dotDateUtc(later) - dotDateUtc(earlier)) / DAY_MS;
}

function dayAfterDotDate(value: string) {
  const next = new Date(dotDateUtc(value) + DAY_MS);
  return new Date(next.getUTCFullYear(), next.getUTCMonth(), next.getUTCDate());
}

export { dayAfterDotDate, daysBetweenDotDates, formatTicketDotDate, formatTicketSelectLabel, startOfTicketDay };
