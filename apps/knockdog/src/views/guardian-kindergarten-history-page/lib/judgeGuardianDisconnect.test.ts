import { describe, expect, test } from 'vitest';

import { judgeGuardianDisconnect } from './judgeGuardianDisconnect';

import type { GuardianDisconnectEligibility } from '@entities/guardian-home';

const createEligibility = (overrides: Partial<GuardianDisconnectEligibility>): GuardianDisconnectEligibility => ({
  canDisconnect: false,
  hasTodayAttendance: false,
  tickets: [],
  reservation: null,
  ...overrides,
});

const TICKET = { name: '10회권', remainingCount: 6, expiresOn: '2026-12-31' };
const RESERVATION = { date: '2026-12-01', time: '15:00' };

describe('해제 가능 조건 판정', () => {
  test('해제할 수 있다고 알려 주면 해제를 진행한다고 판정한다', () => {
    const result = judgeGuardianDisconnect(createEligibility({ canDisconnect: true }));

    expect(result).toBe('proceed');
  });

  test('사용 가능한 이용권이 있으면 이용권 안내로 판정한다', () => {
    const result = judgeGuardianDisconnect(createEligibility({ tickets: [TICKET] }));

    expect(result).toBe('tickets');
  });

  test('이용권과 예약이 함께 남아 있어도 이용권 안내로 판정한다', () => {
    const result = judgeGuardianDisconnect(createEligibility({ tickets: [TICKET], reservation: RESERVATION }));

    expect(result).toBe('tickets');
  });

  test('이용권 없이 예약만 남아 있으면 예약 안내로 판정한다', () => {
    const result = judgeGuardianDisconnect(createEligibility({ reservation: RESERVATION }));

    expect(result).toBe('reservation');
  });

  test('오늘 등원 기록이 있으면 이용권·예약이 함께 남아 있어도 당일 등원 안내로 판정한다', () => {
    const result = judgeGuardianDisconnect(
      createEligibility({ hasTodayAttendance: true, tickets: [TICKET], reservation: RESERVATION })
    );

    expect(result).toBe('todayAttendance');
  });
});
