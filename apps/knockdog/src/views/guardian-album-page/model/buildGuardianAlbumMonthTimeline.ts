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
 * - 연결/해제는 날짜당 기본 1개 (재연결 connected도 노출)
 * - 당일 해제+재연결: 시작 → 해제 → 사진
 * - 그날이 periods 최초 연결일이면 사진 아래에도 시작 1회 추가 (최초 연결 마커)
 * - 최초만 있는 날(당일 해제 없음): 해제 → 사진 → 시작
 */
function buildGuardianAlbumMonthTimeline(
  days: GuardianAlbumDayAlbum[],
  periods: GuardianAlbumMembershipPeriod[],
  selectedMonth: Date
): GuardianAlbumTimelineRow[] {
  const connectedDates = new Set<string>();
  const disconnectedDates = new Set<string>();
  let earliestConnectedAt: Date | null = null;

  for (const period of periods) {
    const connectedKey = formatDateKey(startOfDay(period.connectedAt));
    if (isSameYearMonthKey(connectedKey, selectedMonth)) {
      connectedDates.add(connectedKey);
    }

    if (
      earliestConnectedAt == null ||
      period.connectedAt.getTime() < earliestConnectedAt.getTime()
    ) {
      earliestConnectedAt = period.connectedAt;
    }

    if (period.disconnectedAt) {
      const disconnectedKey = formatDateKey(startOfDay(period.disconnectedAt));
      if (isSameYearMonthKey(disconnectedKey, selectedMonth)) {
        disconnectedDates.add(disconnectedKey);
      }
    }
  }

  const firstConnectedKey =
    earliestConnectedAt != null ? formatDateKey(startOfDay(earliestConnectedAt)) : null;
  const isFirstConnectedInSelectedMonth =
    firstConnectedKey != null && isSameYearMonthKey(firstConnectedKey, selectedMonth);

  const dayByKey = new Map(days.map((day) => [day.dateKey, day] as const));
  const dateKeys = Array.from(
    new Set([...dayByKey.keys(), ...connectedDates, ...disconnectedDates])
  ).sort((left, right) => (left < right ? 1 : left > right ? -1 : 0));

  const rows: GuardianAlbumTimelineRow[] = [];

  for (const dateKey of dateKeys) {
    const hasDisconnected = disconnectedDates.has(dateKey);
    const hasConnected = connectedDates.has(dateKey);
    const day = dayByKey.get(dateKey);
    const isSameDayReconnect = hasConnected && hasDisconnected;
    const isFirstConnectionDay =
      isFirstConnectedInSelectedMonth && dateKey === firstConnectedKey;

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

    if (isSameDayReconnect) {
      // 재연결 마커: 시작 → 해제 → 사진
      pushConnected();
      pushDisconnected();
      pushDay();
      // 최초 연결일이면 사진 아래에 최초 시작 마커 추가
      if (day && isFirstConnectionDay) {
        rows.push({
          type: 'connected',
          id: `connected-${dateKey}-first`,
          dateKey,
        });
      }
    } else if (day) {
      pushDisconnected();
      pushDay();
      pushConnected();
    } else {
      pushDisconnected();
      pushConnected();
    }
  }

  return rows;
}

export { buildGuardianAlbumMonthTimeline };
export type { GuardianAlbumTimelineRow };
