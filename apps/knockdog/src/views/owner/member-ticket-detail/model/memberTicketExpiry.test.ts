import { describe, expect, it } from 'vitest';

import { applyExpiryExtension, canExtendExpiry } from './memberTicketExpiry';

describe('memberTicketExpiry', () => {
  it('기존 만료일보다 뒤인 날짜만 연장할 수 있다', () => {
    expect(canExtendExpiry(null, '2026.12.05')).toBe(false);
    expect(canExtendExpiry('2026.12.04', null)).toBe(false);
    expect(canExtendExpiry('2026.12.04', '2026.12.04')).toBe(false);
    expect(canExtendExpiry('2026.12.04', '2026.11.01')).toBe(false);
    expect(canExtendExpiry('2026.12.04', '2026.12.05')).toBe(true);
  });

  it('연장하면 만료일과 남은 일수를 늘리고 이력을 위에 추가한다', () => {
    const ticket = {
      endsOn: '2026.12.04',
      remainingDays: 41,
      history: [{ id: 'charge', title: '충전', detail: '2026.09.01', isCancelled: false }],
    };

    const next = applyExpiryExtension(ticket, '2026.12.05');

    expect(next.endsOn).toBe('2026.12.05');
    expect(next.remainingDays).toBe(42);
    expect(next.history[0]).toMatchObject({ title: '연장', detail: '만료일 2026.12.05 변경' });
    expect(ticket.endsOn).toBe('2026.12.04');
    expect(ticket.history).toHaveLength(1);
  });

  it('앞당기면 만료일과 이력을 그대로 둔다', () => {
    const ticket = {
      endsOn: '2026.12.04',
      remainingDays: 41,
      history: [{ id: 'charge', title: '충전', detail: '2026.09.01', isCancelled: false }],
    };

    expect(applyExpiryExtension(ticket, '2026.11.01')).toBe(ticket);
  });
});