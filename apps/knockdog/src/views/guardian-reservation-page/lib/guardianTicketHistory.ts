import type { ReservationTicket } from '@views/guardian-reservation-page/lib/guardianReservationMain';

const WEEKDAY_LABEL = ['일', '월', '화', '수', '목', '금', '토'] as const;

const HISTORY_KIND = {
  charge: 'charge',
  use: 'use',
  cancel: 'cancel',
  hold: 'hold',
  release: 'release',
  extend: 'extend',
} as const;

type HistoryKind = keyof typeof HISTORY_KIND;

interface TicketHistory {
  id: string;
  occurredAt: string;
  kind: HistoryKind;
  count: number | null;
  remainingCount: number | null;
  detailOn: string | null;
  isVoided: boolean;
}

interface HistoryRow {
  title: string;
  amount: string;
  description: string;
  isVoided: boolean;
}

interface HistoryGroup {
  dateKey: string;
  label: string;
  entries: TicketHistory[];
}

function toDotDate(value: string) {
  return value.split('-').join('.');
}

function weekdayOf(value: string) {
  const [year, month, day] = value.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return WEEKDAY_LABEL[date.getDay()] ?? '';
}

function formatHistoryDate(dateKey: string) {
  const [, month = '', day = ''] = dateKey.split('-');
  return `${Number(month)}월 ${Number(day)}일`;
}

function formatAttendanceNote(dateKey: string) {
  return `${toDotDate(dateKey)}. (${weekdayOf(dateKey)}) 등원 예약`;
}

function formatAmount(remainingCount: number | null) {
  if (remainingCount == null) return '-';
  return `${remainingCount}회`;
}

function formatHistoryEntry(entry: TicketHistory): HistoryRow {
  const amount = formatAmount(entry.remainingCount);
  const detailOn = entry.detailOn ?? '';

  if (entry.kind === HISTORY_KIND.charge) {
    return {
      title: `${entry.count ?? 0}회 충전`,
      amount,
      description: `이용권 시작일: ${toDotDate(detailOn)}`,
      isVoided: false,
    };
  }

  if (entry.kind === HISTORY_KIND.use) {
    return {
      title: '사용',
      amount,
      description: formatAttendanceNote(detailOn),
      isVoided: entry.isVoided,
    };
  }

  if (entry.kind === HISTORY_KIND.cancel) {
    return { title: '사용 취소', amount, description: '예약을 취소했어요', isVoided: false };
  }

  if (entry.kind === HISTORY_KIND.hold) {
    return {
      title: '홀딩',
      amount,
      description: `${toDotDate(detailOn)}에 홀딩이 끝나요`,
      isVoided: false,
    };
  }

  if (entry.kind === HISTORY_KIND.release) {
    return { title: '홀딩 해제', amount, description: '이용권을 다시 쓸 수 있어요', isVoided: false };
  }

  return {
    title: '이용기간 연장',
    amount,
    description: `${toDotDate(detailOn)}까지 사용할 수 있어요`,
    isVoided: false,
  };
}

function groupTicketHistory(entries: TicketHistory[]): HistoryGroup[] {
  const sorted = entries.slice().sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
  const groups: HistoryGroup[] = [];

  for (const entry of sorted) {
    const dateKey = entry.occurredAt.slice(0, 10);
    const current = groups[groups.length - 1];
    if (current?.dateKey === dateKey) {
      current.entries.push(entry);
      continue;
    }
    groups.push({ dateKey, label: formatHistoryDate(dateKey), entries: [entry] });
  }

  return groups;
}

function createChargeHistory(ticket: ReservationTicket): TicketHistory {
  return {
    id: `${ticket.id}-charge`,
    occurredAt: ticket.chargedAt,
    kind: HISTORY_KIND.charge,
    count: ticket.totalCount,
    remainingCount: ticket.totalCount,
    detailOn: ticket.startsOn,
    isVoided: false,
  };
}

function visibleTickets(tickets: ReservationTicket[], hiddenIds: readonly string[]) {
  if (hiddenIds.length === 0) return tickets;
  return tickets.filter((ticket) => !hiddenIds.includes(ticket.id));
}

export {
  HISTORY_KIND,
  createChargeHistory,
  formatHistoryEntry,
  groupTicketHistory,
  visibleTickets,
};
export type { HistoryGroup, HistoryKind, HistoryRow, TicketHistory };
