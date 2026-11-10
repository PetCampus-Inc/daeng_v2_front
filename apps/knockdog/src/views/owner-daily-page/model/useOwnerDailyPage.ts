import { useEffect, useMemo, useState } from 'react';

import type { OwnerDailyTab } from '@views/owner-daily-page/config/ownerDailyContent';
import {
  createDateFromDateKey,
  getNextKstMidnightDelay,
  getOwnerDailyDayKind,
} from '@views/owner-daily-page/lib/ownerDailyDate';
import { getDateWithPartChanged } from '@views/owner-daily-page/lib/ownerDailyDatePicker';

import {
  useAttendanceCheckinoutCandidatesQuery,
  useAttendanceCheckinoutSummaryQuery,
  useAttendanceCheckinoutTodayQuery,
  type TodayAttendanceFilter,
} from '@entities/owner-attendance-checkinout';
import { useUserStore } from '@entities/user';

import { addDays, formatDateKey, getKstDateKey, isAfterDay, isSameDay, startOfDay } from '@shared/lib/calendar-date';

/** 지각 칩 등 시각에 따라 바뀌는 화면을 이 간격으로 다시 계산한다. */
const NOW_REFRESH_INTERVAL_MS = 10_000;

/**
 * 일과 화면의 날짜·탭 상태와 서버 조회를 한곳에서 관리한다.
 * - 날짜: 항상 오늘로 시작한다. 오늘을 보는 중에 자정이 지나면 새 오늘로 따라간다.
 * - 탭: 오늘은 `등원처리`, 지난·미래 날짜는 `등원목록`이 기본이고 날짜를 바꾸면 기본 탭으로 돌아간다.
 * - 등원처리 탭의 검색어와 `지각` 토글: 탭을 오가도 유지된다. 토글 초기값은 `initialLateOnly`로 열어 둔다.
 * - 등원목록 필터 칩(`todayFilter`): 칩을 바꾸면 서버 필터로 다시 조회하고, 날짜를 바꾸면 `전체`로 돌아간다.
 * - 등원 가능 시간 미설정: 현황 응답이 미설정이면(`isNotConfigured`) 오늘 날짜만 보여 주고 날짜 이동을 막는다.
 * - 조회: 현황(summary)은 항상, 등원 대상(candidates)은 오늘·미래, 등원목록(today)은 오늘·지난 날짜만 한다.
 */
const useOwnerDailyPage = ({ initialLateOnly = false }: { initialLateOnly?: boolean } = {}) => {
  const userId = useUserStore((state) => state.user?.userId);
  const [now, setNow] = useState(() => new Date());
  const [selectedDateOverride, setSelectedDateOverride] = useState<Date | null>(null);
  const [selectedTabOverride, setSelectedTabOverride] = useState<OwnerDailyTab | null>(null);
  const [keyword, setKeyword] = useState('');
  const [lateOnly, setLateOnly] = useState(initialLateOnly);
  const [todayFilter, setTodayFilter] = useState<TodayAttendanceFilter | undefined>(undefined);

  const todayKey = getKstDateKey(now);
  const today = useMemo(() => createDateFromDateKey(todayKey), [todayKey]);
  const selectedDate = selectedDateOverride ?? today;
  const selectedDateKey = formatDateKey(selectedDate);
  const dayKind = getOwnerDailyDayKind(selectedDate, today);
  const selectedTab: OwnerDailyTab =
    selectedTabOverride ?? (dayKind === 'today' ? 'attendance-check' : 'attendance-list');

  const minDate = useMemo(() => startOfDay(new Date(today.getFullYear() - 1, 0, 1)), [today]);
  const maxDate = useMemo(() => getDateWithPartChanged(today, 'year', 1), [today]);

  const hasCandidates = dayKind !== 'past';
  const hasTodayList = dayKind !== 'future';
  const summaryQuery = useAttendanceCheckinoutSummaryQuery({ date: selectedDateKey, userId });
  const candidatesQuery = useAttendanceCheckinoutCandidatesQuery({
    date: selectedDateKey,
    userId,
    enabled: hasCandidates,
  });
  const todayListQuery = useAttendanceCheckinoutTodayQuery({
    date: selectedDateKey,
    filter: todayFilter,
    userId,
    enabled: hasTodayList,
  });

  const isNotConfigured = summaryQuery.data?.reservationSettingConfigured === false;
  const isPrevDayDisabled = isNotConfigured || !isAfterDay(selectedDate, minDate);
  const isNextDayDisabled = isNotConfigured || !isAfterDay(maxDate, selectedDate);

  // 미설정이면 지난·미래 날짜를 보고 있었더라도 오늘로 돌려놓는다.
  if (isNotConfigured && (selectedDateOverride || selectedTabOverride)) {
    setSelectedDateOverride(null);
    setSelectedTabOverride(null);
    setTodayFilter(undefined);
  }

  // 날짜가 바뀐 직후에는 이전 날짜의 목록이 잠깐 남아 있으므로(placeholder) 불러오는 중으로 본다.
  const isCandidatesLoading = hasCandidates && (candidatesQuery.isLoading || candidatesQuery.isPlaceholderData);
  const isLoading = summaryQuery.isLoading || isCandidatesLoading || (hasTodayList && todayListQuery.isLoading);
  const isError =
    summaryQuery.isError || (hasCandidates && candidatesQuery.isError) || (hasTodayList && todayListQuery.isError);

  useEffect(() => {
    const refreshNow = () => setNow(new Date());
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshNow();
    };
    const interval = window.setInterval(refreshNow, NOW_REFRESH_INTERVAL_MS);
    const midnightTimeout = window.setTimeout(refreshNow, getNextKstMidnightDelay());

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(midnightTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [todayKey]);

  /** 날짜를 바꾸고 탭을 그 날짜의 기본 탭으로 되돌린다. 오늘로 돌아오면 자정 롤오버를 따라가게 한다. */
  const handleDateSelect = (date: Date) => {
    if (isNotConfigured) return;

    setSelectedDateOverride(isSameDay(date, today) ? null : startOfDay(date));
    setSelectedTabOverride(null);
    setTodayFilter(undefined);
  };

  const candidates = hasCandidates && !candidatesQuery.isPlaceholderData ? candidatesQuery.data?.items : undefined;
  // 오늘·미래 날짜에 예약한 원생이 하나도 없다. 조회 중이거나 실패하면 candidates가 없어 false다.
  const isNoReservation = candidates?.length === 0;

  return {
    now,
    today,
    selectedDate,
    selectedDateKey,
    dayKind,
    selectedTab,
    minDate,
    maxDate,
    isPrevDayDisabled,
    isNextDayDisabled,
    summary: summaryQuery.data,
    candidates,
    isNoReservation,
    isNotConfigured,
    todayList: hasTodayList ? todayListQuery.data : undefined,
    isLoading,
    isError,
    keyword,
    lateOnly,
    todayFilter,
    setKeyword,
    setLateOnly,
    setTodayFilter,
    handleDateSelect,
    handlePrevDayClick: () => handleDateSelect(addDays(selectedDate, -1)),
    handleNextDayClick: () => handleDateSelect(addDays(selectedDate, 1)),
    handleTodayClick: () => handleDateSelect(today),
    handleTabChange: (tab: OwnerDailyTab) => setSelectedTabOverride(tab),
  };
};

export { useOwnerDailyPage };
