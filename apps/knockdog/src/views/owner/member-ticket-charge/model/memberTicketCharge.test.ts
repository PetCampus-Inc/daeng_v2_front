import { describe, expect, it } from 'vitest';

import { canChargeTicket, chargeCountError, chargeEndDate, formatChargeDotDate } from './memberTicketCharge';

const start = new Date(2026, 9, 24);

describe('chargeEndDate', () => {
  it('시작일에 개월을 더한 전날을 만료일로 계산한다', () => {
    expect(formatChargeDotDate(chargeEndDate(start, { kind: 'month', months: 3 })!)).toBe('2027.01.23');
  });

  it('만료 없음은 만료일을 만들지 않는다', () => {
    expect(chargeEndDate(start, { kind: 'none' })).toBeNull();
  });
});

describe('chargeCountError', () => {
  it('1회와 1000회는 통과하고 범위를 벗어나면 오류를 반환한다', () => {
    expect(chargeCountError('1')).toBeNull();
    expect(chargeCountError('1000')).toBeNull();
    expect(chargeCountError('1001')).toBe('충전 횟수는 1~1000회 사이로 입력해 주세요.');
  });
});

describe('canChargeTicket', () => {
  it('이름과 횟수가 있으면 충전할 수 있다', () => {
    expect(canChargeTicket('체험권', '10', null)).toBe(true);
    expect(canChargeTicket(' ', '10', null)).toBe(false);
    expect(canChargeTicket('체험권', '0', null)).toBe(false);
  });
});
