import type { GuardianAlbumMembershipPeriod } from '@entities/guardian-album';
import type { GuardianSchoolRecordDay } from '@entities/guardian-home';
import { formatDateKey, startOfDay } from '@shared/lib/calendar-date';

import type {
  GuardianDailyNoticeMonthItem,
  GuardianDailyNoticeTimelineRow,
} from '@views/guardian-daily-notice-list-page/model/guardianDailyNoticeTimelineTypes';

function isSameYearMonthKey(dateKey: string, month: Date) {
  const year = month.getFullYear();
  const monthValue = month.getMonth() + 1;
  const [keyYear, keyMonth] = dateKey.split('-').map(Number);
  return keyYear === year && keyMonth === monthValue;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-');
  return startOfDay(new Date(Number(year), Number(month) - 1, Number(day)));
}

function toNoticeItem(day: GuardianSchoolRecordDay): GuardianDailyNoticeMonthItem {
  const date = parseDateKey(day.dateKey);
  return {
    dateKey: day.dateKey,
    date,
    checkInAt: day.checkInAt ?? null,
    checkOutAt: day.checkOutAt ?? null,
    dailyNotice: day.dailyNotice ?? null,
    thumbnailUrl: day.thumbnailUrl ?? null,
  };
}

function hasNoticeRecord(day: GuardianSchoolRecordDay) {
  return Boolean(day.checkInAt || day.checkOutAt || day.dailyNotice);
}

/**
 * 월별 알림장 days + connections periods → 최신순 타임라인.
 * - 재원 중: 앨범과 동일 — 당일 재연결 시 시작 → 해제 → 알림장
 * - 해제 이력 조회: 항상 해제 → 알림장 → 시작
 */
function buildGuardianDailyNoticeMonthTimeline(
  days: GuardianSchoolRecordDay[],
  periods: GuardianAlbumMembershipPeriod[],
  selectedMonth: Date,
  options: { isDisconnectedView?: boolean } = {}
): GuardianDailyNoticeTimelineRow[] {
  const { isDisconnectedView = false } = options;
  const connectedDates = new Set<string>();
  const disconnectedDates = new Set<string>();
  const sameDayReconnectDates = new Set<string>();
  let earliestConnectedAt: Date | null = null;

  const periodDateKeys = periods.map((period) => ({
    period,
    connectedKey: formatDateKey(startOfDay(period.connectedAt)),
    disconnectedKey: period.disconnectedAt
      ? formatDateKey(startOfDay(period.disconnectedAt))
      : null,
  }));

  for (const { period, connectedKey, disconnectedKey } of periodDateKeys) {
    if (isSameYearMonthKey(connectedKey, selectedMonth)) {
      connectedDates.add(connectedKey);
    }

    if (
      earliestConnectedAt == null ||
      period.connectedAt.getTime() < earliestConnectedAt.getTime()
    ) {
      earliestConnectedAt = period.connectedAt;
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
    if (hasLaterConnectSameDay) sameDayReconnectDates.add(ended.disconnectedKey);
  }

  const firstConnectedKey =
    earliestConnectedAt != null ? formatDateKey(startOfDay(earliestConnectedAt)) : null;
  const isFirstConnectedInSelectedMonth =
    firstConnectedKey != null && isSameYearMonthKey(firstConnectedKey, selectedMonth);

  const dayByKey = new Map(days.map((day) => [day.dateKey, day] as const));
  const dateKeys = Array.from(
    new Set([...dayByKey.keys(), ...connectedDates, ...disconnectedDates])
  ).sort((left, right) => (left < right ? 1 : left > right ? -1 : 0));

  const rows: GuardianDailyNoticeTimelineRow[] = [];

  for (const dateKey of dateKeys) {
    const hasDisconnected = disconnectedDates.has(dateKey);
    const hasConnected = connectedDates.has(dateKey);
    const day = dayByKey.get(dateKey);
    const isSameDayReconnect = sameDayReconnectDates.has(dateKey);
    const isFirstConnectionDay =
      isFirstConnectedInSelectedMonth && dateKey === firstConnectedKey;
    const date = parseDateKey(dateKey);

    const pushDisconnected = () => {
      if (!hasDisconnected) return;
      rows.push({
        type: 'disconnected',
        id: `disconnected-${dateKey}`,
        dateKey,
        date,
      });
    };
    const pushConnected = () => {
      if (!hasConnected) return;
      rows.push({
        type: 'connected',
        id: `connected-${dateKey}`,
        dateKey,
        date,
      });
    };
    const pushNotice = () => {
      if (!day || !hasNoticeRecord(day)) return;
      rows.push({
        type: 'notice',
        id: `notice-${dateKey}`,
        dateKey,
        date,
        item: toNoticeItem(day),
      });
    };

    const useReconnectOrder = isSameDayReconnect && !isDisconnectedView;

    if (useReconnectOrder) {
      pushConnected();
      pushDisconnected();
      pushNotice();
      if (day && isFirstConnectionDay) {
        rows.push({
          type: 'connected',
          id: `connected-${dateKey}-first`,
          dateKey,
          date,
        });
      }
    } else if (day && hasNoticeRecord(day)) {
      pushDisconnected();
      pushNotice();
      pushConnected();
    } else {
      pushDisconnected();
      pushConnected();
    }
  }

  return rows;
}

export { buildGuardianDailyNoticeMonthTimeline };
