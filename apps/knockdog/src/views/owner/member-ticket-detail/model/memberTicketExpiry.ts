import { daysBetweenDotDates } from './memberTicketDate';

interface ExpiryHistoryLine {
  id: string;
  title: string;
  detail: string;
  isCancelled: boolean;
}

interface ExpirableTicket {
  endsOn: string | null;
  remainingDays: number | null;
  history: ExpiryHistoryLine[];
}

function toExpiryApiDate(dotDate: string) {
  const [year = '', month = '', day = ''] = dotDate.split('.');
  if (!year || !month || !day) return null;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function canExtendExpiry(currentEndsOn: string | null, nextEndsOn: string | null) {
  if (currentEndsOn == null || nextEndsOn == null) return false;
  return nextEndsOn > currentEndsOn;
}

function applyExpiryExtension<Ticket extends ExpirableTicket>(ticket: Ticket, nextEndsOn: string): Ticket {
  if (ticket.endsOn == null || !canExtendExpiry(ticket.endsOn, nextEndsOn)) return ticket;

  const addedDays = daysBetweenDotDates(ticket.endsOn, nextEndsOn);

  return {
    ...ticket,
    endsOn: nextEndsOn,
    remainingDays: ticket.remainingDays == null ? null : ticket.remainingDays + addedDays,
    history: [
      {
        id: `extend-${nextEndsOn}`,
        title: '연장',
        detail: `만료일 ${nextEndsOn} 변경`,
        isCancelled: false,
      },
      ...ticket.history,
    ],
  };
}

export { applyExpiryExtension, canExtendExpiry, toExpiryApiDate };
export type { ExpirableTicket, ExpiryHistoryLine };
