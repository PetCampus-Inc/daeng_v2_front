import { describe, expect, test } from 'vitest';

import { ApiError } from '@shared/api';

import { classifyGuardianDisconnectError } from './classifyGuardianDisconnectError';

describe('해제 실패 오류 구분', () => {
  test.each([
    ['SCHOOL_MEMBERSHIP-409-1', 409, 'todayAttendance'],
    ['GUARDIAN_SCHOOL_CONNECTION-409-1', 409, 'alreadyDisconnected'],
    ['GUARDIAN_SCHOOL_CONNECTION-409-2', 409, 'ticketsOrReservationRemain'],
    ['GUARDIAN_SCHOOL_CONNECTION-404-1', 404, 'other'],
    ['UNKNOWN_ERROR', 500, 'other'],
  ])('서버 오류는 문구가 아니라 오류 코드로 구분한다 (%s)', (code, status, expected) => {
    expect(classifyGuardianDisconnectError(new ApiError(status, code as never, '문구는 달라도 된다'))).toBe(expected);
  });

  test('오류 문구에 등원이 들어 있어도 코드가 다르면 당일 등원으로 보지 않는다', () => {
    expect(classifyGuardianDisconnectError(new ApiError(500, 'UNKNOWN_ERROR', '등원 처리 중 오류'))).toBe('other');
  });

  test('서버 오류가 아닌 예외는 그 밖의 오류로 구분한다', () => {
    expect(classifyGuardianDisconnectError(new Error('network'))).toBe('other');
  });
});
