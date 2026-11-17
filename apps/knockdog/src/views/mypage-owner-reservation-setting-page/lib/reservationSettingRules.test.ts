import { describe, expect, it } from 'vitest';

import {
  EMPTY_RESERVATION_SETTING,
  applyConfirmedTime,
  canSaveReservationSetting,
  capacityLimitError,
  keepUnsavedReservationEdits,
  sanitizeDailyCapacity,
  timeOrderError,
} from './reservationSettingRules';

const savedPair = {
  ...EMPTY_RESERVATION_SETTING,
  weekdayStart: '09:00',
  weekdayEnd: '18:00',
  weekendStart: '10:00',
  weekendEnd: '17:00',
};

describe('timeOrderError', () => {
  it('시작이 종료보다 이르면 오류가 없다', () => {
    expect(timeOrderError('09:00', '18:00')).toBeNull();
  });

  it('한쪽만 있으면 순서를 보지 않는다', () => {
    expect(timeOrderError('09:00', null)).toBeNull();
    expect(timeOrderError(null, '18:00')).toBeNull();
  });

  it('시작이 종료와 같거나 늦으면 오류다', () => {
    expect(timeOrderError('09:00', '09:00')).not.toBeNull();
    expect(timeOrderError('18:00', '09:00')).not.toBeNull();
  });
});

describe('canSaveReservationSetting', () => {
  it('바뀐 값이 없으면 저장할 수 없다', () => {
    expect(canSaveReservationSetting(savedPair, savedPair, null)).toBe(false);
  });

  it('시작과 끝이 둘 다 있으면 저장할 수 있다', () => {
    expect(canSaveReservationSetting({ ...savedPair, dailyCapacity: '12' }, savedPair, null)).toBe(true);
  });

  it('시작만 고르면 저장할 수 없다', () => {
    expect(
      canSaveReservationSetting({ ...EMPTY_RESERVATION_SETTING, weekdayStart: '09:30' }, EMPTY_RESERVATION_SETTING, null)
    ).toBe(false);
  });

  it('평일이 맞아도 주말 짝이 비면 저장할 수 없다', () => {
    expect(
      canSaveReservationSetting(
        { ...savedPair, weekendStart: '10:00', weekendEnd: null },
        EMPTY_RESERVATION_SETTING,
        null
      )
    ).toBe(false);
  });

  it('시작이 종료보다 늦으면 저장할 수 없다', () => {
    expect(
      canSaveReservationSetting(
        { ...savedPair, weekdayStart: '18:00', weekdayEnd: '09:00' },
        EMPTY_RESERVATION_SETTING,
        null
      )
    ).toBe(false);
  });

  it('정원이 예약 최댓값보다 작으면 저장할 수 없다', () => {
    expect(canSaveReservationSetting({ ...savedPair, dailyCapacity: '3' }, EMPTY_RESERVATION_SETTING, 5)).toBe(false);
    expect(capacityLimitError('3', 5)).toContain('5');
  });

  it('정원이 비었거나 최댓값 이상이면 정원 때문에 막지 않는다', () => {
    expect(capacityLimitError('', 5)).toBeNull();
    expect(capacityLimitError('5', 5)).toBeNull();
    expect(capacityLimitError('3', null)).toBeNull();
  });

  it('정원이 1보다 작으면 저장할 수 없고 정원 오류를 보여 준다', () => {
    expect(capacityLimitError('0', null)).toBe('하루 정원은 1마리 이상이어야 해요.');
    expect(canSaveReservationSetting({ ...savedPair, dailyCapacity: '0' }, savedPair, null)).toBe(false);
  });
});

describe('keepUnsavedReservationEdits', () => {
  it('기준과 다른 칸만 남기고 나머지는 새 값으로 바꾼다', () => {
    const current = { ...savedPair, weekdayStart: '10:00', dailyCapacity: '4' };
    const next = { ...savedPair, weekdayStart: '08:00', dailyCapacity: '9', weekendEnd: '16:00' };

    expect(keepUnsavedReservationEdits(savedPair, current, next)).toEqual({
      ...next,
      weekdayStart: '10:00',
      dailyCapacity: '4',
    });
  });
});

describe('sanitizeDailyCapacity', () => {
  it('숫자만 남기고 세 자리까지 받는다', () => {
    expect(sanitizeDailyCapacity('1a2')).toBe('12');
    expect(sanitizeDailyCapacity('1234')).toBe('123');
  });
});

describe('applyConfirmedTime', () => {
  it('고른 칸만 바꾸고 반대편은 비워 둔다', () => {
    const next = applyConfirmedTime(EMPTY_RESERVATION_SETTING, 'weekdayStart', '09:30');

    expect(next.weekdayStart).toBe('09:30');
    expect(next.weekdayEnd).toBeNull();
    expect(next.weekendStart).toBeNull();
    expect(next.weekendEnd).toBeNull();
  });
});
