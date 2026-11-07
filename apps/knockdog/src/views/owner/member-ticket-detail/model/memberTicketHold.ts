interface HoldHistoryLine {
  id: string;
  title: string;
  detail: string;
  isCancelled: boolean;
}

interface HoldableTicket {
  status: string;
  history: HoldHistoryLine[];
}

function startOfHoldDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatHoldDotDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}.${month}.${day}`;
}

function formatHoldSelectLabel(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function canConfirmHold(startsOn: string | null, endsOn: string | null) {
  if (startsOn == null || endsOn == null) return false;
  return endsOn >= startsOn;
}

function applyTicketHold<Ticket extends HoldableTicket>(ticket: Ticket, startsOn: string, endsOn: string, today: Date): Ticket {
  const isStarted = startsOn <= formatHoldDotDate(today);

  return {
    ...ticket,
    status: isStarted ? 'onHold' : ticket.status,
    history: [
      {
        id: `hold-${startsOn}-${endsOn}`,
        title: '홀딩',
        detail: `기간 ${startsOn} ~ ${endsOn}`,
        isCancelled: false,
      },
      ...ticket.history,
    ],
  };
}

export { applyTicketHold, canConfirmHold, formatHoldDotDate, formatHoldSelectLabel, startOfHoldDay };
export type { HoldableTicket, HoldHistoryLine };
