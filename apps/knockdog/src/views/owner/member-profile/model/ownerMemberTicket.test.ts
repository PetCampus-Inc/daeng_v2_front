import { describe, expect, it } from 'vitest';

import {
  NO_END_DATE_LABEL,
  TICKET_STATUS,
  toOwnerMemberTicketView,
  type OwnerMemberTicket,
} from './ownerMemberTicket';

const today = new Date(2026, 10, 5);

const ticket: OwnerMemberTicket = {
  id: 'trial',
  name: '체험권',
  status: TICKET_STATUS.active,
  remainingCount: 3,
  totalCount: 10,
  startsOn: '2026-08-01',
  endsOn: '2026-11-30',
};

describe('toOwnerMemberTicketView', () => {
  it('사용중이고 종료일이 남으면 잔여 일수를 계산한다', () => {
    const view = toOwnerMemberTicketView(ticket, today);

    expect(view.status).toBe(TICKET_STATUS.active);
    expect(view.remainingDays).toBe(25);
    expect(view.period).toBe('2026.08.01 ~ 2026.11.30');
  });

  it('종료일이 없으면 만료 없음이고 잔여 일수는 없다', () => {
    const view = toOwnerMemberTicketView(
      { ...ticket, status: TICKET_STATUS.scheduled, endsOn: null },
      today
    );

    expect(view.status).toBe(TICKET_STATUS.scheduled);
    expect(view.period.endsWith(NO_END_DATE_LABEL)).toBe(true);
    expect(view.remainingDays).toBeNull();
  });

  it('잔여 횟수가 없으면 기간이 남아도 만료다', () => {
    const view = toOwnerMemberTicketView({ ...ticket, remainingCount: 0 }, today);

    expect(view.status).toBe(TICKET_STATUS.expired);
    expect(view.remainingDays).toBeNull();
  });

  it('종료일이 지나면 잔여 횟수가 있어도 만료다', () => {
    const view = toOwnerMemberTicketView({ ...ticket, endsOn: '2026-11-04' }, today);

    expect(view.status).toBe(TICKET_STATUS.expired);
    expect(view.remainingDays).toBeNull();
  });

  it('종료일 당일은 만료가 아니고 남은 일수는 0이다', () => {
    const view = toOwnerMemberTicketView({ ...ticket, endsOn: '2026-11-05' }, today);

    expect(view.status).toBe(TICKET_STATUS.active);
    expect(view.remainingDays).toBe(0);
  });

  it('홀딩은 만료 조건이 아니면 유지한다', () => {
    const view = toOwnerMemberTicketView({ ...ticket, status: TICKET_STATUS.onHold }, today);

    expect(view.status).toBe(TICKET_STATUS.onHold);
    expect(view.remainingDays).toBe(25);
  });
});
