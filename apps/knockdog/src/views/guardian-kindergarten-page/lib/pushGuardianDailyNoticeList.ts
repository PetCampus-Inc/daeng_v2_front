import { route } from '@shared/constants/route';
import type { Query } from '@shared/lib/bridge/queryUtils';
import { formatDateKey, startOfDay } from '@shared/lib/calendar-date';

interface PushGuardianDailyNoticeListOptions {
  schoolId?: string | null;
  /** `YYYY-MM`. 없으면 month 쿼리 생략 */
  month?: string | null;
}

function toMonthQuery(date: Date) {
  return formatDateKey(startOfDay(date)).slice(0, 7);
}

function pushGuardianDailyNoticeList(
  push: (options: { pathname: string; query?: Query }) => void,
  options?: PushGuardianDailyNoticeListOptions
) {
  push({
    pathname: route.compare.notice.list.root,
    query: {
      ...(options?.schoolId ? { schoolId: options.schoolId } : {}),
      ...(options?.month ? { month: options.month } : {}),
    },
  });
}

export { pushGuardianDailyNoticeList, toMonthQuery };
export type { PushGuardianDailyNoticeListOptions };
