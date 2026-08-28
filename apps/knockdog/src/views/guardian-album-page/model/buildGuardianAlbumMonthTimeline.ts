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
 * - 단일 사이클 당일 종료: 해제 → 사진 → 시작
 * - 해제 후 재연결(다른 사이클이 같은 날 시작, 이후 종료돼도 동일): 시작 → 해제 → 사진
 *
 * 동일 날짜의 connectedAt/disconnectedAt은 period가 여러 개여도 배너 1개만 노출.
 */
function buildGuardianAlbumMonthTimeline(
  days: GuardianAlbumDayAlbum[],
  periods: GuardianAlbumMembershipPeriod[],
  selectedMonth: Date
): GuardianAlbumTimelineRow[] {
  const connectedDates = new Set<string>();
  const disconnectedDates = new Set<string>();
  /** 같은 날 이전 사이클 해제 후 다른 사이클이 시작한 날짜(재연결 최신) */
  const hasReconnectOnDate = new Set<string>();

  const periodDateKeys = periods.map((period) => ({
    period,
    connectedKey: formatDateKey(startOfDay(period.connectedAt)),
    disconnectedKey: period.disconnectedAt
      ? formatDateKey(startOfDay(period.disconnectedAt))
      : null,
  }));

  for (const { connectedKey, disconnectedKey } of periodDateKeys) {
    if (isSameYearMonthKey(connectedKey, selectedMonth)) {
      connectedDates.add(connectedKey);
    }
    if (disconnectedKey && isSameYearMonthKey(disconnectedKey, selectedMonth)) {
      disconnectedDates.add(disconnectedKey);
    }
  }

  for (const ended of periodDateKeys) {
    if (!ended.disconnectedKey || !isSameYearMonthKey(ended.disconnectedKey, selectedMonth)) {
      continue;
    }
    const endedAt = ended.period.disconnectedAt;
    if (!endedAt) continue;

    const hasLaterConnectSameDay = periodDateKeys.some((started) => {
      if (started.period === ended.period) return false;
      if (started.connectedKey !== ended.disconnectedKey) return false;
      return started.period.connectedAt.getTime() >= endedAt.getTime();
    });
    if (hasLaterConnectSameDay) hasReconnectOnDate.add(ended.disconnectedKey);
  }

  const dayByKey = new Map(days.map((day) => [day.dateKey, day] as const));
  const dateKeys = Array.from(
    new Set([...dayByKey.keys(), ...connectedDates, ...disconnectedDates])
  ).sort((left, right) => (left < right ? 1 : left > right ? -1 : 0));

  const rows: GuardianAlbumTimelineRow[] = [];

  for (const dateKey of dateKeys) {
    const hasDisconnected = disconnectedDates.has(dateKey);
    const hasConnected = connectedDates.has(dateKey);
    const day = dayByKey.get(dateKey);
    const isReconnectNewest =
      hasDisconnected && hasConnected && hasReconnectOnDate.has(dateKey);

    const pushDisconnected = () => {
      if (!hasDisconnected) return;
      rows.push({
        type: 'disconnected',
        id: `disconnected-${dateKey}`,
        dateKey,
      });
    };
    const pushConnected = () => {
      if (!hasConnected) return;
      rows.push({
        type: 'connected',
        id: `connected-${dateKey}`,
        dateKey,
      });
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
