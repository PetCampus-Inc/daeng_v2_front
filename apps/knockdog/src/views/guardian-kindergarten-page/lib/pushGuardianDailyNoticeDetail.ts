import { route } from '@shared/constants/route';
import type { Query } from '@shared/lib/bridge/queryUtils';
import { formatDateKey, startOfDay } from '@shared/lib/calendar-date';
import type { NotificationEntrySource } from '@shared/lib/notification';

interface PushGuardianDailyNoticeDetailOptions {
  petId?: string | null;
  source?: NotificationEntrySource | null;
  schoolId?: string | null;
}

function pushGuardianDailyNoticeDetail(
  push: (options: { pathname: string; query?: Query }) => void,
  date: Date,
  options?: PushGuardianDailyNoticeDetailOptions
) {
  push({
    pathname: route.compare.notice.root,
    query: {
      date: formatDateKey(startOfDay(date)),
      ...(options?.petId ? { petId: options.petId } : {}),
      ...(options?.source ? { source: options.source } : {}),
      ...(options?.schoolId ? { schoolId: options.schoolId } : {}),
    },
  });
}

export { pushGuardianDailyNoticeDetail };
export type { PushGuardianDailyNoticeDetailOptions };
