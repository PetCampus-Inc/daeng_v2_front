import type { GuardianAlbumMembershipPeriod } from '@entities/guardian-album';
import { formatDateKey, startOfDay } from '@shared/lib/calendar-date';

import type { GuardianAlbumDayAlbum } from '@views/guardian-album-page/config/guardianAlbumMonthMock';

type GuardianAlbumTimelineRow =
  | {
      type: 'day';
      id: string;
      dateKey: string;
      day: GuardianAlbumDayAlbum;
    }
  | {
      type: 'connected';
      id: string;
      dateKey: string;
    }
  | {
      type: 'disconnected';
      id: string;
      dateKey: string;
    };

function isSameYearMonthKey(dateKey: string, month: Date) {
  const year = month.getFullYear();
  const monthValue = month.getMonth() + 1;
  const [keyYear, keyMonth] = dateKey.split('-').map(Number);
  return keyYear === year && keyMonth === monthValue;
}

/**
 * 월별 앨범 days + periods → 최신순 타임라인.
 *
 * 같은 날 connect+disconnect 분기:
 * - 해제로 끝난 날(ACTIVE 사이클 없음): 해제 → 사진 → 시작
 * - 해제 후 재연결 날(그날 시작한 ACTIVE 있음): 시작 → 해제 → 사진
 */
function buildGuardianAlbumMonthTimeline(
  days: GuardianAlbumDayAlbum[],
  periods: GuardianAlbumMembershipPeriod[],
  selectedMonth: Date
): GuardianAlbumTimelineRow[] {
  const connectedByDate = new Map<string, number>();
  const disconnectedByDate = new Map<string, number>();
  const hasActiveConnectOnDate = new Set<string>();

  for (const period of periods) {
    const connectedKey = formatDateKey(startOfDay(period.connectedAt));
    if (isSameYearMonthKey(connectedKey, selectedMonth)) {
      connectedByDate.set(connectedKey, (connectedByDate.get(connectedKey) ?? 0) + 1);
      if (!period.disconnectedAt) hasActiveConnectOnDate.add(connectedKey);
    }
    if (!period.disconnectedAt) continue;
    const disconnectedKey = formatDateKey(startOfDay(period.disconnectedAt));
    if (isSameYearMonthKey(disconnectedKey, selectedMonth)) {
      disconnectedByDate.set(
        disconnectedKey,
        (disconnectedByDate.get(disconnectedKey) ?? 0) + 1
      );
    }
  }

  const dayByKey = new Map(days.map((day) => [day.dateKey, day] as const));
  const dateKeys = Array.from(
    new Set([
      ...dayByKey.keys(),
      ...connectedByDate.keys(),
      ...disconnectedByDate.keys(),
    ])
  ).sort((left, right) => (left < right ? 1 : left > right ? -1 : 0));

  const rows: GuardianAlbumTimelineRow[] = [];

  for (const dateKey of dateKeys) {
    const disconnectedCount = disconnectedByDate.get(dateKey) ?? 0;
    const connectedCount = connectedByDate.get(dateKey) ?? 0;
    const day = dayByKey.get(dateKey);
    const isReconnectNewest =
      disconnectedCount > 0 && connectedCount > 0 && hasActiveConnectOnDate.has(dateKey);

    const pushDisconnected = () => {
      for (let index = 0; index < disconnectedCount; index += 1) {
        rows.push({
          type: 'disconnected',
          id: `disconnected-${dateKey}-${index}`,
          dateKey,
        });
      }
    };
    const pushConnected = () => {
      for (let index = 0; index < connectedCount; index += 1) {
        rows.push({
          type: 'connected',
          id: `connected-${dateKey}-${index}`,
          dateKey,
        });
      }
    };
    const pushDay = () => {
      if (!day) return;
      rows.push({
        type: 'day',
        id: `day-${dateKey}`,
        dateKey,
        day,
      });
    };

    if (isReconnectNewest) {
      pushConnected();
      pushDisconnected();
      pushDay();
    } else {
      pushDisconnected();
      pushDay();
      pushConnected();
    }
  }

  return rows;
}

export { buildGuardianAlbumMonthTimeline };
export type { GuardianAlbumTimelineRow };
