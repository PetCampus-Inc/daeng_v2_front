import { describe, expect, test } from 'vitest';

import { getKstDateKey } from '@views/owner-daily-page/lib/ownerDailyDate';

describe('날짜 기준과 날짜 이동', () => {
  test('한국 시간(KST) 기준으로 오늘 날짜를 판단한다. UTC로는 전날 오후 3시 이후여도 한국 날짜로 센다', () => {
    // UTC 2026-11-09 15:00 = KST 2026-11-10 00:00
    expect(getKstDateKey(new Date('2026-11-09T15:00:00Z'))).toBe('2026-11-10');
    // UTC 2026-11-09 14:59 = KST 2026-11-09 23:59
    expect(getKstDateKey(new Date('2026-11-09T14:59:00Z'))).toBe('2026-11-09');
  });
});
