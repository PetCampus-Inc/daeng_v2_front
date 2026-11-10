import { describe, expect, test } from 'vitest';

import { getDateWithPartChanged, getDaysInMonth } from '@views/owner-daily-page/lib/ownerDailyDatePicker';

describe('날짜 선택 시트', () => {
  test('평년 2월은 28일까지만 고를 수 있고 2월 30일은 고를 수 없다', () => {
    expect(getDaysInMonth(2026, 1)).toBe(28);

    // 2월 안에서 일 휠을 계속 돌려도 2월 29일·30일이나 3월이 나오지 않는다
    let date = new Date(2026, 1, 27);
    for (let step = 0; step < 40; step += 1) {
      date = getDateWithPartChanged(date, 'day', 1);
      expect(date.getMonth()).toBe(1);
      expect(date.getDate()).toBeLessThanOrEqual(28);
    }
  });

  test('윤년 2월은 29일까지 고를 수 있다', () => {
    expect(getDaysInMonth(2028, 1)).toBe(29);

    const feb28 = new Date(2028, 1, 28);
    expect(getDateWithPartChanged(feb28, 'day', 1).getDate()).toBe(29);
  });

  test('월을 바꿔서 선택한 일이 그 달에 없으면 그 달의 마지막 날로 보정한다 (10월 31일 → 11월 30일)', () => {
    const next = getDateWithPartChanged(new Date(2026, 9, 31), 'month', 1);

    expect(next.getMonth()).toBe(10);
    expect(next.getDate()).toBe(30);
  });
});
