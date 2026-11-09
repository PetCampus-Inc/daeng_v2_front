import { describe, expect, it } from 'vitest';

import { toOwnerMemberStatusBadge } from './ownerMemberStatusBadge';

describe('등록 원생 한 줄의 상태 배지', () => {
  it('잔여 1회 때문에 만료예정이면 `1회 남음` 배지를 보여준다', () => {
    expect(toOwnerMemberStatusBadge({ ticketState: 'EXPIRING', expiringReason: 'REMAINING_ONE', daysLeft: 90 })).toBe(
      '1회 남음'
    );
  });

  it('남은 기간 때문에 만료예정이면 `D-{남은 일수}` 배지를 보여준다', () => {
    expect(toOwnerMemberStatusBadge({ ticketState: 'EXPIRING', expiringReason: 'DAYS_LEFT', daysLeft: 3 })).toBe('D-3');
  });

  it('만료일 당일(남은 일수 0)이면 `D-0` 배지를 보여준다', () => {
    expect(toOwnerMemberStatusBadge({ ticketState: 'EXPIRING', expiringReason: 'DAYS_LEFT', daysLeft: 0 })).toBe('D-0');
  });

  it('가진 이용권이 모두 만료면 `만료` 배지를 보여준다', () => {
    expect(toOwnerMemberStatusBadge({ ticketState: 'EXPIRED', expiringReason: null, daysLeft: null })).toBe('만료');
  });

  it('만료예정·만료가 아니면(이용권 없음 포함) 배지를 보여주지 않는다', () => {
    expect(toOwnerMemberStatusBadge({ ticketState: 'VALID', expiringReason: null, daysLeft: 30 })).toBeNull();
    expect(toOwnerMemberStatusBadge({ ticketState: 'NONE', expiringReason: null, daysLeft: null })).toBeNull();
  });
});
