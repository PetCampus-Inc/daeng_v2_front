import { describe, expect, test } from 'vitest';

import {
  parseOwnerDailyDateParam,
  parseOwnerDailyLateOnlyParam,
  parseOwnerDailyTabParam,
  parseOwnerDailyFilterParam,
} from '@views/owner-daily-page/lib/ownerDailyUrlState';

describe('주소의 날짜 값', () => {
  test('`YYYY-MM-DD` 형식의 실제 날짜는 그 날짜로 읽는다', () => {
    const date = parseOwnerDailyDateParam('2026-06-17');

    expect([date?.getFullYear(), date?.getMonth(), date?.getDate()]).toEqual([2026, 5, 17]);
  });

  test.each([
    ['값이 없음', null],
    ['빈 문자열', ''],
    ['없는 날짜(2월 31일)', '2026-02-31'],
    ['없는 날짜(13월)', '2026-13-01'],
    ['월·일이 한 자리', '2026-6-1'],
    ['앞에 공백', ' 2026-06-17'],
    ['지수 표기', '1e3'],
    ['날짜 뒤에 글자', '2026-06-17abc'],
  ])('%s는 날짜로 읽지 않는다', (_name, value) => {
    expect(parseOwnerDailyDateParam(value)).toBeNull();
  });
});

describe('주소의 탭·필터·지각 값', () => {
  test('탭 이름 두 개만 읽고 그 밖의 값은 기본 탭(null)으로 본다', () => {
    expect(parseOwnerDailyTabParam('attendance-check')).toBe('attendance-check');
    expect(parseOwnerDailyTabParam('attendance-list')).toBe('attendance-list');
    expect(parseOwnerDailyTabParam('today-attendance')).toBeNull();
    expect(parseOwnerDailyTabParam('')).toBeNull();
    expect(parseOwnerDailyTabParam(null)).toBeNull();
  });

  test('등원목록 필터 이름 세 개만 읽고 그 밖의 값은 `전체`(undefined)로 본다', () => {
    expect(parseOwnerDailyFilterParam('CURRENTLY_IN')).toBe('CURRENTLY_IN');
    expect(parseOwnerDailyFilterParam('UNSENT_RECORD')).toBe('UNSENT_RECORD');
    expect(parseOwnerDailyFilterParam('ABSENT')).toBe('ABSENT');
    expect(parseOwnerDailyFilterParam('absent')).toBeUndefined();
    expect(parseOwnerDailyFilterParam(null)).toBeUndefined();
  });

  test('지각 토글은 정확히 `true`일 때만 켠다', () => {
    expect(parseOwnerDailyLateOnlyParam('true')).toBe(true);
    expect(parseOwnerDailyLateOnlyParam('TRUE')).toBe(false);
    expect(parseOwnerDailyLateOnlyParam('1')).toBe(false);
    expect(parseOwnerDailyLateOnlyParam(null)).toBe(false);
  });
});
