import { describe, expect, test } from 'vitest';

import { alignDiaryDateToMonth, resolveDiaryDayKind } from './resolveGuardianDiaryDay';

describe('일기장 선택 날짜', () => {
  const today = new Date(2026, 5, 17);

  test('이번 달에서 오늘 이후 일은 오늘로 맞춘다', () => {
    const next = alignDiaryDateToMonth(new Date(2026, 5, 1), new Date(2026, 5, 30), today);

    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(5);
    expect(next.getDate()).toBe(17);
  });

  test('지난달이면 같은 날짜를 고른다', () => {
    const next = alignDiaryDateToMonth(new Date(2026, 4, 1), today, today);

    expect(next.getMonth()).toBe(4);
    expect(next.getDate()).toBe(17);
  });

  test('일기가 있으면 작성된 날이고, 크레딧이 없으면 작성 제안 대신 소진이다', () => {
    expect(resolveDiaryDayKind(true, true, 0)).toBe('written');
    expect(resolveDiaryDayKind(false, true, 0)).toBe('spent');
    expect(resolveDiaryDayKind(false, true, 3)).toBe('today');
    expect(resolveDiaryDayKind(false, false, 3)).toBe('past');
  });
});
