import { route } from '@shared/constants/route';
import type { Query } from '@shared/lib/bridge/queryUtils';
import { formatDateKey, startOfDay } from '@shared/lib/calendar-date';

function pushGuardianDailyNoticeDetail(
  push: (options: { pathname: string; query?: Query }) => void,
  date: Date
) {
  push({
    pathname: route.compare.notice.root,
    query: { date: formatDateKey(startOfDay(date)) },
  });
}

export { pushGuardianDailyNoticeDetail };
