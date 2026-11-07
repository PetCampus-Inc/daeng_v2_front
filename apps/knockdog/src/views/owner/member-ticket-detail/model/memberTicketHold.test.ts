import { describe, expect, it } from 'vitest';

import { applyTicketHold, canConfirmHold } from './memberTicketHold';

const TODAY = new Date(2026, 10, 7);

describe('memberTicketHold', () => {
  it('시작일과 종료일이 있고 종료일이 시작일 이상일 때만 홀딩할 수 있다', () => {
    expect(canConfirmHold(null, null)).toBe(false);
    expect(canConfirmHold('2026.11.01', null)).toBe(false);
    expect(canConfirmHold('2026.12.01', '2026.11.01')).toBe(false);
    expect(canConfirmHold('2026.11.01', '2026.11.01')).toBe(true);
    expect(canConfirmHold('2026.11.01', '2026.12.01')).toBe(true);
  });

  it('시작일이 오늘 이전이면 홀딩중이 되고 잔여와 만료일은 그대로다', () => {
    const ticket = {
      status: 'active',
      remainingCount: 8,
      endsOn: '2026.12.04',
      remainingDays: 41,
      history: [{ id: 'charge', title: '충전', detail: '2026.09.01', isCancelled: false }],
    };

    const next = applyTicketHold(ticket, '2026.11.01', '2026.12.01', TODAY);

    expect(next.status).toBe('onHold');
    expect(next.remainingCount).toBe(8);
    expect(next.endsOn).toBe('2026.12.04');
    expect(next.remainingDays).toBe(41);
    expect(next.history[0]).toMatchObject({ title: '홀딩', detail: '기간 2026.11.01 ~ 2026.12.01' });
    expect(ticket.history).toHaveLength(1);
  });

  it('시작일이 미래면 기존 상태를 유지하고 이력만 추가한다', () => {
    const ticket = {
      status: 'active',
      history: [{ id: 'charge', title: '충전', detail: '2026.09.01', isCancelled: false }],
    };

    const next = applyTicketHold(ticket, '2026.11.08', '2026.12.01', TODAY);

    expect(next.status).toBe('active');
    expect(next.history).toHaveLength(2);
    expect(ticket.status).toBe('active');
  });
});
