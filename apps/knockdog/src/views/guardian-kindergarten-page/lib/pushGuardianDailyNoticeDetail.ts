import { route } from '@shared/constants/route';
import type { Query } from '@shared/lib/bridge/queryUtils';
import { formatDateKey, startOfDay } from '@shared/lib/calendar-date';
import type { NotificationEntrySource } from '@shared/lib/notification';

function pushGuardianDailyNoticeDetail(
  push: (options: { pathname: string; query?: Query }) => void,
  date: Date,
  petId?: string | null,
  source?: NotificationEntrySource | null
) {
  push({
    pathname: route.compare.notice.root,
    query: {
      date: formatDateKey(startOfDay(date)),
      ...(petId ? { petId } : {}),
      ...(source ? { source } : {}),
    },
  });
}

export { pushGuardianDailyNoticeDetail };
