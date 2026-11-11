import { describe, expect, test } from 'vitest';

import { disconnectEligibilityDtoSchema, toDisconnectEligibility } from './guardianDisconnectEligibility';

describe('해제 가능 여부 응답을 화면 모델로 바꾼다', () => {
  test('이용권 만료일이 배열이면 날짜 키로 바꿔 이용권 목록에 담는다', () => {
    const eligibility = toDisconnectEligibility(
      disconnectEligibilityDtoSchema.parse({
        canDisconnect: false,
        blocks: [
          { type: 'TICKET', ticket: { name: '10회권', remainingCount: 6, expiresOn: [2026, 1, 12] } },
          { type: 'TICKET', ticket: { name: '체험권', remainingCount: 1, expiresOn: null } },
        ],
      })
    );

    expect(eligibility.canDisconnect).toBe(false);
    expect(eligibility.tickets).toEqual([
      { name: '10회권', remainingCount: 6, expiresOn: '2026-01-12' },
      { name: '체험권', remainingCount: 1, expiresOn: null },
    ]);
    expect(eligibility.reservation).toBeNull();
  });

  test('예약일이 배열이고 시각이 문자열이면 가장 가까운 예약 1건으로 담는다', () => {
    const eligibility = toDisconnectEligibility(
      disconnectEligibilityDtoSchema.parse({
        canDisconnect: false,
        blocks: [
          {
            type: 'RESERVATION',
            reservation: { date: [2026, 10, 12], time: '15:00', status: '예약 확정' },
          },
        ],
      })
    );

    expect(eligibility.reservation).toEqual({ date: '2026-10-12', time: '15:00' });
    expect(eligibility.tickets).toEqual([]);
  });

  test('ISO 날짜 문자열도 그대로 날짜 키로 받는다', () => {
    const eligibility = toDisconnectEligibility(
      disconnectEligibilityDtoSchema.parse({
        canDisconnect: false,
        blocks: [{ type: 'TICKET', ticket: { name: '10회권', remainingCount: 6, expiresOn: '2026-12-31' } }],
      })
    );

    expect(eligibility.tickets[0]?.expiresOn).toBe('2026-12-31');
  });
});
