import { TICKET_STATUS, type TicketStatus } from '@entities/owner-member';

interface TicketHistoryLine {
  id: string;
  title: string;
  detail: string;
  isCancelled: boolean;
}

interface TicketDetail {
  id: string;
  name: string;
  status: TicketStatus;
  remainingCount: number;
  totalCount: number;
  startsOn: string;
  endsOn: string | null;
  chargedOn: string;
  remainingDays: number | null;
  history: TicketHistoryLine[];
}

/** 상세 시안. 이용권 API 전이라 어떤 카드로 들어와도 이 프레임을 보여 준다. */
const MOCK_TICKET_DETAIL: TicketDetail = {
  id: 'open',
  name: '자유 10회권',
  status: TICKET_STATUS.active,
  remainingCount: 8,
  totalCount: 10,
  startsOn: '2026.09.01',
  endsOn: '2026.12.04',
  chargedOn: '2026.09.01',
  remainingDays: 41,
  history: [
    { id: 'use-2', title: '사용(8회)', detail: '2026.11.01 예약', isCancelled: false },
    { id: 'hold-end', title: '홀딩 해제', detail: '기간 ~ 2026.10.30', isCancelled: false },
    { id: 'hold', title: '홀딩', detail: '기간 2026.09.30 ~ 2026.10.30', isCancelled: false },
    { id: 'use-cancel', title: '사용(8회)', detail: '2026.09.10 예약취소', isCancelled: true },
    { id: 'use-1', title: '사용(9회)', detail: '2026.09.01 예약', isCancelled: false },
    { id: 'charge', title: '충전', detail: '2026.09.01', isCancelled: false },
  ],
};

function findTicketDetail() {
  return MOCK_TICKET_DETAIL;
}

export { findTicketDetail };
export type { TicketDetail, TicketHistoryLine };
