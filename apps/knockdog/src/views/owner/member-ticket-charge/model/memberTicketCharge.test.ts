import { describe, expect, it } from 'vitest';

import {
  canChargeTicket,
  chargeCountError,
  chargeEndDate,
  chargePresetDetail,
  formatChargeDotDate,
  formatChargeSelectLabel,
  toChargePreset,
  toChargeTicketRequest,
} from './memberTicketCharge';

const start = new Date(2026, 9, 24);

describe('chargeEndDate', () => {
  it('시작일에 개월을 더한 전날을 만료일로 계산한다', () => {
    expect(formatChargeDotDate(chargeEndDate(start, { kind: 'month', months: 3 })!)).toBe('2027.01.23');
  });

  it('만료 없음은 만료일을 만들지 않는다', () => {
    expect(chargeEndDate(start, { kind: 'none' })).toBeNull();
  });
});

describe('formatChargeSelectLabel', () => {
  it('월과 일을 0 없이 적는다', () => {
    expect(formatChargeSelectLabel(start)).toBe('2026년 10월 24일');
  });
});

describe('chargeCountError', () => {
  it('1회와 1000회는 통과하고 범위를 벗어나면 오류를 반환한다', () => {
    expect(chargeCountError('1')).toBeNull();
    expect(chargeCountError('1000')).toBeNull();
    expect(chargeCountError('1001')).toBe('충전 횟수는 1~1000회 사이로 입력해 주세요.');
  });
});

describe('toChargePreset', () => {
  it('등록 이용권의 만료 없음과 개월 칩, 그 외 기간을 충전 값으로 바꾼다', () => {
    expect(
      toChargePreset({ id: '1', name: '정기권 10회', chargeCount: 10, duration: { type: 'NONE' } })
    ).toEqual({ id: '1', name: '정기권 10회', count: 10, duration: { kind: 'none' } });
    expect(
      chargePresetDetail(
        toChargePreset({ id: '2', name: '3개월권', chargeCount: 20, duration: { type: 'FIXED', value: 3, unit: 'MONTH' } })
      )
    ).toBe('20회 • 3개월');
    expect(
      toChargePreset({ id: '3', name: '14일권', chargeCount: 8, duration: { type: 'FIXED', value: 14, unit: 'DAY' } }).duration
    ).toEqual({ kind: 'custom', amount: 14, unit: 'day' });
  });
});

describe('toChargeTicketRequest', () => {
  it('만료 없음은 시작일, 이름, 횟수만 보낸다', () => {
    expect(toChargeTicketRequest(start, '  정기권   10회  ', '10', { kind: 'none' })).toEqual({
      startDate: '2026-10-24',
      name: '정기권 10회',
      chargeCount: 10,
    });
  });

  it('개월과 일 단위를 서버 단위로 바꾼다', () => {
    expect(toChargeTicketRequest(start, '정기권', '10', { kind: 'month', months: 3 })).toMatchObject({
      validityValue: 3,
      validityUnit: 'MONTH',
    });
    expect(toChargeTicketRequest(start, '정기권', '10', { kind: 'custom', amount: 14, unit: 'day' })).toMatchObject({
      validityValue: 14,
      validityUnit: 'DAY',
    });
  });
});

describe('canChargeTicket', () => {
  it('이름과 횟수가 있으면 충전할 수 있다', () => {
    expect(canChargeTicket('체험권', '10', null)).toBe(true);
    expect(canChargeTicket(' ', '10', null)).toBe(false);
    expect(canChargeTicket('체험권', '0', null)).toBe(false);
  });
});
