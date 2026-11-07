import { describe, expect, it } from 'vitest';

import { applyTicketHold, canConfirmHold, cancelTicketHold } from './memberTicketHold';

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
      hold: null,
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
      endsOn: '2026.12.04',
      remainingDays: 41,
      hold: null,
      history: [{ id: 'charge', title: '충전', detail: '2026.09.01', isCancelled: false }],
    };

    const next = applyTicketHold(ticket, '2026.11.08', '2026.12.01', TODAY);

    expect(next.status).toBe('active');
    expect(next.history).toHaveLength(2);
    expect(ticket.status).toBe('active');
  });

  it('진행 중인 홀딩을 취소하면 지난 날만 만료일을 늘리고 오늘부터 다시 쓴다', () => {
    const ticket = applyTicketHold(
      {
        status: 'active',
        endsOn: '2026.12.04',
        remainingDays: 41,
        hold: null,
        history: [{ id: 'charge', title: '충전', detail: '2026.09.01', isCancelled: false }],
      },
      '2026.11.01',
      '2026.12.01',
      TODAY
    );

    const next = cancelTicketHold(ticket, TODAY);

    expect(next.status).toBe('active');
    expect(next.endsOn).toBe('2026.12.10');
    expect(next.remainingDays).toBe(47);
    expect(next.hold).toBeNull();
    expect(next.history[0]).toMatchObject({ title: '홀딩 해제', detail: '기간 2026.11.06' });
    expect(ticket.endsOn).toBe('2026.12.04');
  });

  it('시작 전 홀딩을 취소하면 만료일을 늘리지 않는다', () => {
    const ticket = applyTicketHold(
      {
        status: 'active',
        endsOn: '2026.12.04',
        remainingDays: 41,
        hold: null,
        history: [{ id: 'charge', title: '충전', detail: '2026.09.01', isCancelled: false }],
      },
      '2026.11.08',
      '2026.12.01',
      TODAY
    );

    const next = cancelTicketHold(ticket, TODAY);

    expect(next.endsOn).toBe('2026.12.04');
    expect(next.remainingDays).toBe(41);
    expect(next.history[0]).toMatchObject({ title: '홀딩 해제', detail: '기간 2026.11.07' });
  });

  it('홀딩이 없으면 취소해도 그대로다', () => {
    const ticket = {
      status: 'active',
      endsOn: '2026.12.04',
      remainingDays: 41,
      hold: null,
      history: [{ id: 'charge', title: '충전', detail: '2026.09.01', isCancelled: false }],
    };

    expect(cancelTicketHold(ticket, TODAY)).toBe(ticket);
  });
});
