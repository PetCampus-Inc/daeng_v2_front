import { formatHourClock, formatVisitDate, parseVisitKey, toVisitKey } from '@views/guardian-reservation-page/lib/visitClock';

function canCancelReservation(startsAt: string, now: Date) {
  return startsAt > toVisitKey(now);
}

function formatDetailDate(startsAt: string) {
  return formatVisitDate(parseVisitKey(startsAt));
}

function formatDetailClock(startsAt: string) {
  const date = parseVisitKey(startsAt);
  return formatHourClock(date.getHours(), date.getMinutes(), false);
}

function formatCancelWhen(startsAt: string) {
  const date = parseVisitKey(startsAt);
  return `${formatVisitDate(date)} ${formatHourClock(date.getHours(), date.getMinutes(), true)}`;
}

function formatDeadlineLead(startsAt: string) {
  const deadline = parseVisitKey(startsAt);
  deadline.setMinutes(deadline.getMinutes() - 1);
  return `${formatVisitDate(deadline)} ${formatHourClock(deadline.getHours(), deadline.getMinutes(), false)}까지 `;
}

export { canCancelReservation, formatCancelWhen, formatDeadlineLead, formatDetailClock, formatDetailDate };
