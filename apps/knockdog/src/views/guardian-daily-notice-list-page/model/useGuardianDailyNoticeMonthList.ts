'use client';

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import {
  getGuardianCalendarDetail,
  guardianCalendarDetailQueryKey,
  toGuardianCalendarDetail,
  type GuardianCalendarDailyNotice,
  type GuardianCalendarDetail,
} from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { useGuardianAlbumMonth } from '@views/guardian-album-page/model/useGuardianAlbumMonth';
import { addDays, formatDateKey, isAfterDay, isBeforeDay, startOfDay } from '@shared/lib/calendar-date';

interface GuardianDailyNoticeMonthItem {
  /** YYYY-MM-DD */
  dateKey: string;
  date: Date;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  dailyNotice: GuardianCalendarDailyNotice | null;
  thumbnailUrl: string | null;
}

interface UseGuardianDailyNoticeMonthListParams {
  schoolId?: string | null;
  petId?: string | null;
  selectedMonth: Date;
  firstAttendedAt?: Date | null;
  enabled?: boolean;
}

function hasCheckIn(detail: GuardianCalendarDetail | undefined) {
  if (!detail) return false;
  if (detail.checkInAt) return true;
  const status = detail.checkinoutStatus;
  return status === 'CHECKED_IN' || status === 'CHECKED_OUT';
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-');
  return startOfDay(new Date(Number(year), Number(month) - 1, Number(day)));
}

/** 선택 월에서 조회할 날짜 — 첫 등원일 이후, 오늘까지. 최신순 */
function buildMonthDateKeys(month: Date, firstAttendedAt: Date | null, today: Date) {
  const monthStart = startOfDay(new Date(month.getFullYear(), month.getMonth(), 1));
  const monthEnd = startOfDay(new Date(month.getFullYear(), month.getMonth() + 1, 0));
  const rangeStart =
    firstAttendedAt && isBeforeDay(monthStart, firstAttendedAt)
      ? startOfDay(firstAttendedAt)
      : monthStart;
  const rangeEnd = isAfterDay(monthEnd, today) ? startOfDay(today) : monthEnd;

  if (isAfterDay(rangeStart, rangeEnd)) return [];

  const dateKeys: string[] = [];
  for (let cursor = rangeEnd; !isBeforeDay(cursor, rangeStart); cursor = addDays(cursor, -1)) {
    dateKeys.push(formatDateKey(cursor));
  }
  return dateKeys;
}

/**
 * 선택 월의 등원일별 알림장 리스트.
 * 등하원·알림장은 `calendar/detail`(일자별), 썸네일은 월별 앨범 응답에서 가져온다.
 */
function useGuardianDailyNoticeMonthList({
  schoolId,
  petId,
  selectedMonth,
  firstAttendedAt = null,
  enabled = true,
}: UseGuardianDailyNoticeMonthListParams) {
  const userId = useUserStore((state) => state.user?.userId);

  const dateKeys = useMemo(
    () => buildMonthDateKeys(selectedMonth, firstAttendedAt, new Date()),
    [selectedMonth, firstAttendedAt]
  );

  const canQuery = enabled && Boolean(userId) && Boolean(petId) && dateKeys.length > 0;

  const { days: albumDays } = useGuardianAlbumMonth({
    schoolId,
    petId,
    selectedMonth,
    enabled: enabled && Boolean(schoolId) && Boolean(petId),
  });

  const thumbnailByDateKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const day of albumDays) {
      const url = day.photos[0]?.url;
      if (url) map.set(day.dateKey, url);
    }
    return map;
  }, [albumDays]);

  const queries = useQueries({
    queries: dateKeys.map((date) => ({
      queryKey: guardianCalendarDetailQueryKey(userId, petId ?? undefined, date),
      queryFn: () => getGuardianCalendarDetail({ petId: petId!, date }),
      select: (response: Awaited<ReturnType<typeof getGuardianCalendarDetail>>) =>
        toGuardianCalendarDetail(response.data),
      enabled: canQuery,
      staleTime: 60_000,
    })),
  });

  const details = queries.map((query) => query.data);
  const isPending = canQuery && queries.some((query) => query.isPending);
  const hasError = canQuery && queries.some((query) => query.isError);
  /** 개별 쿼리가 순차적으로 도착해도 items가 갱신되도록 */
  const detailsRevision = queries.map((query) => query.dataUpdatedAt).join(',');

  const items = useMemo(() => {
    return dateKeys.reduce<GuardianDailyNoticeMonthItem[]>((acc, dateKey, index) => {
      const detail = details[index];
      if (!hasCheckIn(detail)) return acc;

      acc.push({
        dateKey,
        date: parseDateKey(dateKey),
        checkInAt: detail?.checkInAt ?? null,
        checkOutAt: detail?.checkOutAt ?? null,
        dailyNotice: detail?.dailyNotice ?? null,
        thumbnailUrl: thumbnailByDateKey.get(dateKey) ?? null,
      });
      return acc;
      // eslint-disable-next-line react-hooks/exhaustive-deps -- details는 매 렌더 새 배열이라 detailsRevision으로 추적
    }, []);
  }, [dateKeys, detailsRevision, thumbnailByDateKey]);

  /**
   * 첫 등원 월이면 리스트 하단에 시작 문구 노출.
   * 추후 API에 `firstAttendedAt`이 추가되면 아래 정상 분기를 그대로 탄다.
   */
  const firstAttendanceDate = useMemo(() => {
    if (!firstAttendedAt) {
      const oldestAttendedDate = items[items.length - 1]?.date;
      return oldestAttendedDate ? addDays(oldestAttendedDate, -1) : null;
    }

    const isSameMonth =
      firstAttendedAt.getFullYear() === selectedMonth.getFullYear() &&
      firstAttendedAt.getMonth() === selectedMonth.getMonth();
    return isSameMonth ? startOfDay(firstAttendedAt) : null;
  }, [firstAttendedAt, items, selectedMonth]);

  return {
    items,
    firstAttendanceDate,
    isPending,
    hasError,
  };
}

export { useGuardianDailyNoticeMonthList };
export type { GuardianDailyNoticeMonthItem };
