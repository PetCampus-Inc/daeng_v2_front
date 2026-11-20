import { describe, expect, test } from 'vitest';

import { isLateForCheckIn } from '@views/owner-daily-page/lib/ownerDailyAttendance';

const dateKey = '2026-11-10';
// 한국 시간 09:00 예정. 한국 시간 = UTC + 9시간
const kst = (time: string) => new Date(`${dateKey}T${time}:00+09:00`);

describe('지각 판정', () => {
  test('등원 전이고 현재 시각이 등원 예정 시간 + 30분이면 지각이다 (09:00 예정 → 09:30)', () => {
    expect(
      isLateForCheckIn({ status: 'NOT_CHECKED_IN', dateKey, reservedTime: '09:00', now: kst('09:30') })
    ).toBe(true);
  });

  test('등원 전이고 현재 시각이 등원 예정 시간 + 29분이면 지각이 아니다 (09:00 예정 → 09:29)', () => {
    expect(
      isLateForCheckIn({ status: 'NOT_CHECKED_IN', dateKey, reservedTime: '09:00', now: kst('09:29') })
    ).toBe(false);
  });

  test('등원 완료한 원생은 예정 시간이 한참 지났어도 지각이 아니다', () => {
    expect(
      isLateForCheckIn({ status: 'CHECKED_IN', dateKey, reservedTime: '09:00', now: kst('18:00') })
    ).toBe(false);
  });

  test('결석 처리한 원생은 예정 시간이 한참 지났어도 지각이 아니다', () => {
    expect(isLateForCheckIn({ status: 'ABSENT', dateKey, reservedTime: '09:00', now: kst('18:00') })).toBe(
      false
    );
  });
});
