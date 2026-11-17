import { addDotDays, daysBetweenDotDates, formatTicketDotDate } from './memberTicketDate';

interface HoldHistoryLine {
  id: string;
  title: string;
  detail: string;
  isCancelled: boolean;
}

interface TicketHoldPlan {
  startsOn: string;
  endsOn: string;
  statusBefore: string;
}

interface HoldableTicket {
  status: string;
  endsOn: string | null;
  remainingDays: number | null;
  history: HoldHistoryLine[];
  hold: TicketHoldPlan | null;
}

let holdHistorySerial = 0;

function holdHistoryId(prefix: string) {
  holdHistorySerial += 1;
  return `${prefix}-${holdHistorySerial}`;
}

function canConfirmHold(startsOn: string | null, endsOn: string | null, today?: Date) {
  if (startsOn == null || endsOn == null) return false;
  if (endsOn < startsOn) return false;
  if (today != null && endsOn < formatTicketDotDate(today)) return false;
  return true;
}

/** 취소·자동 종료가 세는 마지막 경계. 예정 종료일 다음 날을 넘지 않는다. */
function holdCountUntil(plan: TicketHoldPlan, todayLabel: string) {
  const dayAfterEnd = addDotDays(plan.endsOn, 1);
  return dayAfterEnd < todayLabel ? dayAfterEnd : todayLabel;
}

function applyTicketHold<Ticket extends HoldableTicket>(ticket: Ticket, startsOn: string, endsOn: string, today: Date): Ticket {
  const todayLabel = formatTicketDotDate(today);
  if (endsOn < todayLabel) return ticket;

  const isStarted = startsOn <= todayLabel;

  return {
    ...ticket,
    status: isStarted ? 'onHold' : ticket.status,
    hold: { startsOn, endsOn, statusBefore: ticket.status },
    history: [
      {
        id: holdHistoryId('hold'),
        title: '홀딩',
        detail: `기간 ${startsOn} ~ ${endsOn}`,
        isCancelled: false,
      },
      ...ticket.history,
    ],
  };
}

function cancelTicketHold<Ticket extends HoldableTicket>(ticket: Ticket, today: Date): Ticket {
  const plan = ticket.hold;
  if (!plan) return ticket;

  const todayLabel = formatTicketDotDate(today);
  const countUntil = holdCountUntil(plan, todayLabel);
  const heldDays = plan.startsOn < countUntil ? daysBetweenDotDates(plan.startsOn, countUntil) : 0;
  const releaseOn = heldDays === 0 ? todayLabel : addDotDays(countUntil, -1);

  return {
    ...ticket,
    status: plan.statusBefore as Ticket['status'],
    endsOn: ticket.endsOn == null || heldDays === 0 ? ticket.endsOn : addDotDays(ticket.endsOn, heldDays),
    remainingDays: ticket.remainingDays == null ? null : ticket.remainingDays + heldDays,
    hold: null,
    history: [
      {
        id: holdHistoryId('hold-end'),
        title: '홀딩 해제',
        detail: `기간 ${releaseOn}`,
        isCancelled: false,
      },
      ...ticket.history,
    ],
  };
}

/** 날짜가 바뀌거나 화면에 다시 들어왔을 때 홀딩 상태를 맞춘다. 종료 연장은 한 번만. */
function syncTicketHold<Ticket extends HoldableTicket>(ticket: Ticket, today: Date): Ticket {
  const plan = ticket.hold;
  if (!plan) return ticket;

  const todayLabel = formatTicketDotDate(today);
  if (todayLabel < plan.startsOn) {
    return ticket.status === plan.statusBefore ? ticket : { ...ticket, status: plan.statusBefore as Ticket['status'] };
  }
  if (todayLabel <= plan.endsOn) {
    return ticket.status === 'onHold' ? ticket : { ...ticket, status: 'onHold' as Ticket['status'] };
  }
  return cancelTicketHold(ticket, today);
}

export { applyTicketHold, canConfirmHold, cancelTicketHold, syncTicketHold };
export { formatTicketDotDate as formatHoldDotDate, formatTicketSelectLabel as formatHoldSelectLabel, startOfTicketDay as startOfHoldDay } from './memberTicketDate';
export type { HoldableTicket, HoldHistoryLine, TicketHoldPlan };
