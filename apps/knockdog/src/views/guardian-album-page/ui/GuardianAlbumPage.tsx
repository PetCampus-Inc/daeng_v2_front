'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import {
  useGuardianSchoolConnectionSchoolsQuery,
  type GuardianSchoolConnection,
} from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import {
  compareYearMonth,
  isSameYearMonth,
  parseDateKey,
  toDateKey,
  type GuardianAlbumDayAlbum,
} from '@views/guardian-album-page/config/guardianAlbumMonthMock';
import type { GuardianAlbumPhoto } from '@views/guardian-album-page/config/guardianAlbumTodayMock';
import type { GuardianAlbumViewMode } from '@views/guardian-album-page/model/guardianAlbumViewMode';
import { fetchGuardianAlbumDayPhotos } from '@views/guardian-album-page/model/fetchGuardianAlbumDayPhotos';
import { resolveGuardianAlbumFavoriteDayPhotos } from '@views/guardian-album-page/model/resolveGuardianAlbumFavoriteDayPhotos';
import { useGuardianAlbumMonth } from '@views/guardian-album-page/model/useGuardianAlbumMonth';
import { useGuardianAlbumToday } from '@views/guardian-album-page/model/useGuardianAlbumToday';
import { expandGuardianAlbumPhotos } from '@views/guardian-album-page/lib/expandGuardianAlbumPhotos';
import { mergeGuardianAlbumDayPhotos } from '@views/guardian-album-page/lib/mergeGuardianAlbumDayPhotos';
import { isGuardianAlbumAccessibleDay } from '@views/guardian-album-page/lib/isGuardianAlbumAccessibleDay';
import { writeLastViewedAt } from '@views/guardian-album-page/lib/guardianAlbumLastViewed';
import { GuardianAlbumDayList } from '@views/guardian-album-page/ui/GuardianAlbumDayList';
import { GuardianAlbumDateSelectSheet } from '@views/guardian-album-page/ui/GuardianAlbumDateSelectSheet';
import { GuardianAlbumEmptyState } from '@views/guardian-album-page/ui/GuardianAlbumEmptyState';
import { useGuardianAlbumAttendedDays } from '@views/guardian-album-page/model/useGuardianAlbumAttendedDays';
import { useGuardianAlbumFavorites } from '@views/guardian-album-page/model/useGuardianAlbumFavorites';
import { useGuardianAlbumFavoriteToggle } from '@views/guardian-album-page/model/useGuardianAlbumFavoriteToggle';
import { useGuardianAlbumLastViewed } from '@views/guardian-album-page/model/useGuardianAlbumLastViewed';
import { buildGuardianAlbumMonthTimeline } from '@views/guardian-album-page/model/buildGuardianAlbumMonthTimeline';
import { GuardianAlbumAttendanceList } from '@views/guardian-album-page/ui/GuardianAlbumAttendanceList';
import { GuardianAlbumFavoriteList } from '@views/guardian-album-page/ui/GuardianAlbumFavoriteList';
import { GuardianAlbumFilterEmpty } from '@views/guardian-album-page/ui/GuardianAlbumFilterEmpty';
import type { GuardianAlbumFilterDay } from '@views/guardian-album-page/ui/GuardianAlbumFilterDaySection';
import { GuardianAlbumFilterSheet } from '@views/guardian-album-page/ui/GuardianAlbumFilterSheet';
import { GuardianAlbumHistoryEmpty } from '@views/guardian-album-page/ui/GuardianAlbumHistoryEmpty';
import { GuardianAlbumInfoSheet } from '@views/guardian-album-page/ui/GuardianAlbumInfoSheet';
import { GuardianAlbumMonthNav } from '@views/guardian-album-page/ui/GuardianAlbumMonthNav';
import { GuardianAlbumMonthEmpty } from '@views/guardian-album-page/ui/GuardianAlbumMonthEmpty';
import { GuardianAlbumMonthPickerSheet } from '@views/guardian-album-page/ui/GuardianAlbumMonthPickerSheet';
import { GuardianAlbumPhotoDetail } from '@views/guardian-album-page/ui/GuardianAlbumPhotoDetail';
import { GuardianAlbumScrollTopButton } from '@views/guardian-album-page/ui/GuardianAlbumScrollTopButton';
import { GuardianAlbumTodaySection } from '@views/guardian-album-page/ui/GuardianAlbumTodaySection';
import { toKindergartenSelectOptions, toKindergartenSelectOptionsFromConnections, toMonthEndDateKey } from '@views/guardian-kindergarten-page/model/toKindergartenSelectOptions';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';
import { Header } from '@widgets/Header';
import { useStackNavigation, useNativeBackHandler } from '@shared/lib/bridge';
import { formatDateKey, startOfDay } from '@shared/lib/calendar-date';
import { KindergartenSelectSheet } from '@shared/ui/kindergarten-select-sheet';
import { PageError } from '@shared/ui/page-error';
import { toast } from '@shared/ui/toast';

interface GuardianAlbumDetailState {
  photos: GuardianAlbumPhoto[];
  initialIndex: number;
  showListButton: boolean;
  /** 오늘의 새 사진이 포함된 상세면 닫을 때 lastViewed에 쓸 max uploadedAt(ms) */
  todayNewViewedAt: number | null;
}

/** 오늘 날짜/lastViewed 이후 사진만 모아 읽음 마커용 max createdAt */
function resolveTodayNewViewedAt(
  photos: GuardianAlbumPhoto[],
  todayDateKey: string,
  lastViewedAt: number
) {
  let maxUploadedAt = 0;
  for (const photo of photos) {
    const uploadedAt = new Date(photo.uploadedAt).getTime();
    if (!Number.isFinite(uploadedAt) || uploadedAt <= lastViewedAt) continue;
    if (toDateKey(new Date(uploadedAt)) !== todayDateKey) continue;
    if (uploadedAt > maxUploadedAt) maxUploadedAt = uploadedAt;
  }
  return maxUploadedAt > 0 ? maxUploadedAt : null;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function parseSchoolIdQuery(value: string | null) {
  return value?.trim() ? value : null;
}

/** 앨범에서 고른 유치원 옵션 → 해당 membership 연결 */
function resolveSelectedConnection(
  connections: GuardianSchoolConnection[] | undefined,
  optionId: string | null,
  schoolId: string | null | undefined,
  attendedUntil: string | null
) {
  const list = connections ?? [];
  if (optionId) {
    const byMembership = list.find((connection) => connection.id === optionId);
    if (byMembership) return byMembership;
  }
  if (!schoolId) return null;

  const candidates = list.filter((connection) => connection.schoolId === schoolId);
  if (candidates.length === 0) return null;

  if (attendedUntil) {
    const matched = candidates.find(
      (connection) =>
        connection.disconnectedAt != null &&
        formatDateKey(connection.disconnectedAt) === attendedUntil
    );
    if (matched) return matched;
  }

  return candidates.find((connection) => connection.disconnectedAt == null) ?? candidates[0] ?? null;
}

function GuardianAlbumPage() {
  const content = guardianAlbumContent;
  const searchParams = useSearchParams();
  const schoolIdFromQuery = parseSchoolIdQuery(searchParams.get('schoolId'));
  const { lastViewedAt, markAsViewed } = useGuardianAlbumLastViewed();
  const [selectedKindergartenId, setSelectedKindergartenId] = useState<string | null>(null);
  const userId = useUserStore((state) => state.user?.userId);
  const { selectedPetId: earlySelectedPetId } = useGuardianSelectedPet();
  const { data: connections } = useGuardianSchoolConnectionSchoolsQuery({
    userId,
    petId: earlySelectedPetId,
    enabled: Boolean(userId) && Boolean(earlySelectedPetId),
  });
  const selectedOptionSchoolId = useMemo(() => {
    const optionId = selectedKindergartenId ?? schoolIdFromQuery;
    if (!optionId) return null;
    const matched = (connections ?? []).find(
      (connection) => connection.id === optionId || connection.schoolId === optionId
    );
    return matched?.schoolId ?? optionId;
  }, [connections, schoolIdFromQuery, selectedKindergartenId]);
  const {
    selectedPet,
    selectedPetId,
    status,
    schoolId,
    schoolName,
    schoolImageUrl,
    hasAlbumHistory,
    hasLinkedSchool,
    isAttendedToday,
    todayPhotoCount,
    todayPhotos,
    todayDate,
    isReady,
    isError: isAlbumTodayError,
    isFetching: isAlbumTodayFetching,
    refetch: refetchAlbumToday,
  } = useGuardianAlbumToday({ schoolId: selectedOptionSchoolId });
  const { back } = useStackNavigation();

  const scrollRef = useRef<HTMLDivElement>(null);
  const didOpenHomeDetailRef = useRef(false);
  const didOpenDateDetailRef = useRef(false);
  /** overlay-kit 바텀시트 — AOS back 시 Stack pop 대신 시트만 닫기 */
  const overlayCloseRef = useRef<(() => void) | null>(null);

  const openAlbumOverlay = useCallback(
    (render: (props: { isOpen: boolean; close: () => void }) => ReactNode) => {
      overlay.open(({ isOpen, close }) => {
        const handleClose = () => {
          overlayCloseRef.current = null;
          close();
        };

        if (isOpen) {
          overlayCloseRef.current = handleClose;
        } else {
          overlayCloseRef.current = null;
        }

        return render({ isOpen, close: handleClose });
      });
    },
    []
  );

  useEffect(
    () => () => {
      overlayCloseRef.current = null;
    },
    []
  );
  const [viewMode, setViewMode] = useState<GuardianAlbumViewMode>('all');
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
  const [syncedQuerySchoolId, setSyncedQuerySchoolId] = useState<string | null>(null);
  const [isScrollTopVisible, setIsScrollTopVisible] = useState(false);
  const [detailState, setDetailState] = useState<GuardianAlbumDetailState | null>(null);
  const [isEntryRetrying, setIsEntryRetrying] = useState(false);

  const kindergartens = useMemo(() => {
    const fromConnections = toKindergartenSelectOptionsFromConnections(connections ?? []);
    if (fromConnections.length > 0) return fromConnections;
    return toKindergartenSelectOptions(
      schoolId && hasLinkedSchool
        ? {
            id: schoolId,
            placeId: null,
            name: schoolName ?? '',
            address: '',
            imageUrl: schoolImageUrl ?? '',
          }
        : null,
      status === 'disconnected' ? toMonthEndDateKey(new Date()) : null
    );
  }, [connections, hasLinkedSchool, schoolId, schoolImageUrl, schoolName, status]);
  const canSelectKindergarten = kindergartens.length > 1;
  const defaultKindergartenId =
    kindergartens.find((item) => item.attendedUntil == null)?.id ?? kindergartens[0]?.id ?? null;
  const queryKindergartenId = useMemo(() => {
    if (!schoolIdFromQuery) return null;
    return (
      kindergartens.find(
        (item) => item.schoolId === schoolIdFromQuery || item.id === schoolIdFromQuery
      )?.id ?? null
    );
  }, [kindergartens, schoolIdFromQuery]);
  const resolvedKindergartenId =
    selectedKindergartenId ?? queryKindergartenId ?? defaultKindergartenId;
  const selectedKindergarten =
    kindergartens.find((item) => item.id === resolvedKindergartenId) ??
    kindergartens[0] ??
    null;

  // schoolId 쿼리로 과거 유치원 진입 시 종료월로 맞춤 (유저 선택 전)
  if (
    queryKindergartenId &&
    !selectedKindergartenId &&
    syncedQuerySchoolId !== queryKindergartenId
  ) {
    setSyncedQuerySchoolId(queryKindergartenId);
    const queryKindergarten =
      kindergartens.find((item) => item.id === queryKindergartenId) ?? null;
    if (queryKindergarten?.attendedUntil != null) {
      setSelectedMonth(startOfMonth(parseDateKey(queryKindergarten.attendedUntil)));
    }
  }

  const activeSchoolId = selectedKindergarten?.schoolId ?? schoolId;
  const kindergartenName = selectedKindergarten?.name ?? schoolName ?? '유치원';
  const petName = selectedPet?.name ?? '강아지';
  const attendedUntil = selectedKindergarten?.attendedUntil ?? null;
  const isDisconnected = attendedUntil != null || status === 'disconnected';
  const hasSelectedSchool = Boolean(activeSchoolId);
  const selectedConnection = useMemo(
    () =>
      resolveSelectedConnection(
        connections,
        selectedKindergarten?.id ?? null,
        activeSchoolId,
        attendedUntil
      ),
    [activeSchoolId, attendedUntil, connections, selectedKindergarten?.id]
  );
  /** schools API 최신 membership 연결일 — firstAvailableMonth 없을 때 월 하한 폴백 */
  const membershipConnectedAt = useMemo(
    () =>
      selectedConnection?.connectedAt ? startOfDay(selectedConnection.connectedAt) : null,
    [selectedConnection]
  );

  const {
    days: monthDays,
    periods: membershipPeriods,
    firstAvailableMonth,
    lastAvailableMonth,
    connectionStartedAt,
    isError: isAlbumMonthError,
    isFetching: isAlbumMonthFetching,
    isPending: isAlbumMonthPending,
    refetch: refetchAlbumMonth,
  } = useGuardianAlbumMonth({
    schoolId: activeSchoolId,
    petId: selectedPetId,
    selectedMonth,
    enabled: hasSelectedSchool,
  });

  const {
    days: favoriteDays,
    hasNextPage: hasFavoriteNextPage,
    isFetchingNextPage: isFavoriteFetchingNextPage,
    fetchNextPage: fetchFavoriteNextPage,
    isPending: isFavoritePending,
  } = useGuardianAlbumFavorites({
    schoolId: activeSchoolId,
    petId: selectedPetId,
    enabled: hasSelectedSchool && viewMode === 'favorite',
  });

  const {
    days: attendanceDays,
    hasNextPage: hasAttendanceNextPage,
    isFetchingNextPage: isAttendanceFetchingNextPage,
    fetchNextPage: fetchAttendanceNextPage,
    isPending: isAttendancePending,
  } = useGuardianAlbumAttendedDays({
    schoolId: activeSchoolId,
    petId: selectedPetId,
    enabled: hasSelectedSchool && viewMode === 'attendance',
  });

  const { toggleFavorite } = useGuardianAlbumFavoriteToggle({
    schoolId: activeSchoolId,
    petId: selectedPetId,
  });
  const albumRangeEnd = useMemo(
    () => (attendedUntil != null ? parseDateKey(attendedUntil) : new Date()),
    [attendedUntil]
  );
  const todayDetailPhotos = useMemo(
    () => expandGuardianAlbumPhotos(todayPhotos, todayPhotoCount),
    [todayPhotos, todayPhotoCount]
  );

  const todayDateKey = todayDate ?? toDateKey(new Date());
  const albumAccessibleContext = useMemo(
    () => ({ todayDateKey, isAttendedToday }),
    [isAttendedToday, todayDateKey]
  );
  const isAlbumDayAccessible = useCallback(
    (day: { dateKey: string; isAttended: boolean }) =>
      isGuardianAlbumAccessibleDay(day, albumAccessibleContext),
    [albumAccessibleContext]
  );
  /**
   * 학교 전체 이력 노출 — 최신 재연결 connectedAt으로 과거를 자르지 않는다.
   * 해제된 유치원만 attendedUntil 상한 적용.
   */
  const isAlbumDateInMembershipRange = useCallback(
    (dateKey: string) => {
      if (attendedUntil && dateKey > attendedUntil) return false;
      return true;
    },
    [attendedUntil]
  );

  const visibleDays = useMemo<GuardianAlbumDayAlbum[]>(() => {
    const hideTodayInList = !isDisconnected && isAttendedToday;
    return monthDays.filter((day) => {
      if (hideTodayInList && day.dateKey === todayDateKey) return false;
      if (!isAlbumDateInMembershipRange(day.dateKey)) return false;
      return isAlbumDayAccessible(day);
    });
  }, [
    monthDays,
    isDisconnected,
    isAttendedToday,
    todayDateKey,
    isAlbumDateInMembershipRange,
    isAlbumDayAccessible,
  ]);

  const isDisconnectedView = useMemo(
    () =>
      isDisconnected ||
      (membershipPeriods.length > 0 &&
        membershipPeriods.every((period) => period.disconnectedAt != null)),
    [isDisconnected, membershipPeriods]
  );

  const monthTimeline = useMemo(
    () =>
      buildGuardianAlbumMonthTimeline(visibleDays, membershipPeriods, selectedMonth, {
        isDisconnectedView,
      }),
    [isDisconnectedView, membershipPeriods, selectedMonth, visibleDays]
  );

  const hasPeriodBanners = membershipPeriods.length > 0;
  const hasMonthTimelineContent = monthTimeline.length > 0;

  const enrichedAttendanceDays = useMemo(() => {
    const monthByDate = new Map(monthDays.map((day) => [day.dateKey, day] as const));
    return attendanceDays
      .filter(
        (day) => isAlbumDateInMembershipRange(day.dateKey) && isAlbumDayAccessible(day)
      )
      .map((day) => mergeGuardianAlbumDayPhotos(day, monthByDate.get(day.dateKey) ?? null));
  }, [attendanceDays, isAlbumDayAccessible, monthDays, isAlbumDateInMembershipRange]);

  const visibleFavoriteDays = useMemo(
    () =>
      favoriteDays.filter(
        (day) => isAlbumDateInMembershipRange(day.dateKey) && isAlbumDayAccessible(day)
      ),
    [favoriteDays, isAlbumDateInMembershipRange, isAlbumDayAccessible]
  );

  const hasAttendancePhotosReady = !isAttendancePending;
  const hasFavoritePhotosReady = !isFavoritePending;

  const isAttendanceFilterExhausted =
    hasAttendancePhotosReady && !hasAttendanceNextPage && !isAttendanceFetchingNextPage;
  const isFavoriteFilterExhausted =
    hasFavoritePhotosReady && !hasFavoriteNextPage && !isFavoriteFetchingNextPage;

  useEffect(() => {
    if (viewMode !== 'attendance') return;
    if (!hasAttendancePhotosReady) return;
    if (enrichedAttendanceDays.length > 0) return;
    if (!hasAttendanceNextPage || isAttendanceFetchingNextPage) return;
    fetchAttendanceNextPage();
  }, [
    viewMode,
    hasAttendancePhotosReady,
    enrichedAttendanceDays.length,
    hasAttendanceNextPage,
    isAttendanceFetchingNextPage,
    fetchAttendanceNextPage,
  ]);

  useEffect(() => {
    if (viewMode !== 'favorite') return;
    if (!hasFavoritePhotosReady) return;
    if (visibleFavoriteDays.length > 0) return;
    if (!hasFavoriteNextPage || isFavoriteFetchingNextPage) return;
    fetchFavoriteNextPage();
  }, [
    viewMode,
    hasFavoritePhotosReady,
    visibleFavoriteDays.length,
    hasFavoriteNextPage,
    isFavoriteFetchingNextPage,
    fetchFavoriteNextPage,
  ]);

  const isFilterEmpty =
    (viewMode === 'attendance' &&
      isAttendanceFilterExhausted &&
      enrichedAttendanceDays.length === 0) ||
    (viewMode === 'favorite' &&
      isFavoriteFilterExhausted &&
      visibleFavoriteDays.length === 0);

  const isFilterMode = viewMode === 'favorite' || viewMode === 'attendance';

  const openDetail = useCallback(
    (photos: GuardianAlbumPhoto[], photoId?: string, showListButton = false) => {
      if (photos.length === 0) return;
      const foundIndex = photoId ? photos.findIndex((photo) => photo.id === photoId) : 0;
      setDetailState({
        photos,
        initialIndex: foundIndex >= 0 ? foundIndex : 0,
        showListButton,
        todayNewViewedAt: resolveTodayNewViewedAt(photos, todayDateKey, lastViewedAt),
      });
    },
    [lastViewedAt, todayDateKey]
  );

  const handleCloseDetail = useCallback(() => {
    if (detailState?.todayNewViewedAt != null) {
      markAsViewed(detailState.todayNewViewedAt);
    }
    setDetailState(null);
  }, [detailState, markAsViewed]);

  const handleOpenTodayDetail = useCallback(
    (photoId?: string) => {
      openDetail(todayDetailPhotos, photoId, false);
    },
    [openDetail, todayDetailPhotos]
  );

  const handleOpenDayDetail = useCallback(
    (dayAlbum: GuardianAlbumDayAlbum) => {
      if (dayAlbum.hasLoadError || !isAlbumDayAccessible(dayAlbum)) return;
      const photos = expandGuardianAlbumPhotos(dayAlbum.photos, dayAlbum.photoCount);
      openDetail(photos, undefined, false);
    },
    [isAlbumDayAccessible, openDetail]
  );

  const handleOpenFilterDayDetail = useCallback(
    async (day: GuardianAlbumFilterDay) => {
      if (!isAlbumDayAccessible(day)) return;

      if (viewMode === 'favorite') {
        if (!activeSchoolId) {
          openDetail(day.photos, undefined, false);
          return;
        }

        const photos = await resolveGuardianAlbumFavoriteDayPhotos(activeSchoolId, day);
        openDetail(photos, undefined, false);
        return;
      }

      if (!activeSchoolId) {
        openDetail(day.photos, undefined, false);
        return;
      }

      try {
        const photos = await fetchGuardianAlbumDayPhotos(activeSchoolId, day.dateKey);
        openDetail(photos.length > 0 ? photos : day.photos, undefined, false);
      } catch {
        openDetail(day.photos, undefined, false);
      }
    },
    [isAlbumDayAccessible, openDetail, activeSchoolId, viewMode]
  );

  /** 날짜 검색 시트 — 선택일 상세 슬라이드 진입 */
  const handleOpenDateDetail = useCallback(
    async (date: Date) => {
      const dateKey = toDateKey(date);
      setSelectedMonth(startOfMonth(date));
      setIsScrollTopVisible(false);

      if (dateKey === todayDateKey) {
        if (!isAttendedToday || todayDetailPhotos.length === 0) return;
        openDetail(todayDetailPhotos, undefined, false);
        return;
      }

      const monthDay = monthDays.find((day) => day.dateKey === dateKey) ?? null;
      if (monthDay && !isAlbumDayAccessible(monthDay)) return;

      if (!activeSchoolId) {
        if (monthDay) handleOpenDayDetail(monthDay);
        return;
      }

      try {
        const photos = await fetchGuardianAlbumDayPhotos(activeSchoolId, dateKey);
        if (photos.length > 0) {
          openDetail(photos, undefined, false);
          return;
        }
      } catch {
        // 월 카드 프리뷰로 폴백
      }

      if (monthDay) handleOpenDayDetail(monthDay);
    },
    [
      handleOpenDayDetail,
      isAlbumDayAccessible,
      isAttendedToday,
      monthDays,
      openDetail,
      activeSchoolId,
      todayDateKey,
      todayDetailPhotos,
    ]
  );

  useEffect(() => {
    if (didOpenHomeDetailRef.current) return;
    if (searchParams.get('from') !== 'home') return;
    if (!hasAlbumHistory || !isAttendedToday || todayDetailPhotos.length === 0) return;

    didOpenHomeDetailRef.current = true;
    openDetail(todayDetailPhotos, undefined, true);
  }, [hasAlbumHistory, isAttendedToday, openDetail, searchParams, todayDetailPhotos]);

  /** 알림함/푸시(사진 업로드 알림) 진입 — 특정 일자 상세 바로 오픈 */
  useEffect(() => {
    if (didOpenDateDetailRef.current) return;
    const dateQuery = searchParams.get('date');
    if (!dateQuery) return;
    if (!activeSchoolId) return;

    didOpenDateDetailRef.current = true;
    void handleOpenDateDetail(parseDateKey(dateQuery));
  }, [activeSchoolId, handleOpenDateDetail, searchParams]);

  const handleResetFilter = useCallback(() => {
    setViewMode('all');
    setIsScrollTopVisible(false);
  }, []);

  const handleHeaderBack = useCallback(() => {
    if (overlayCloseRef.current) {
      overlayCloseRef.current();
      return;
    }
    // 상세/필터는 같은 Stack WebView 오버레이 — AOS/헤더 모두 한 단계씩 닫기
    if (detailState) {
      handleCloseDetail();
      return;
    }
    if (viewMode === 'favorite' || viewMode === 'attendance') {
      handleResetFilter();
      return;
    }
    writeLastViewedAt();
    void back();
  }, [back, detailState, handleCloseDetail, handleResetFilter, viewMode]);

  useNativeBackHandler(handleHeaderBack);

  const handleFilterSelect = useCallback(
    (mode: GuardianAlbumViewMode) => {
      if (mode === 'all') {
        handleResetFilter();
        return;
      }
      setViewMode(mode);
      setIsScrollTopVisible(false);
    },
    [handleResetFilter]
  );

  /**
   * 첫 등원/해제 월 폴백 배너 — periods가 없을 때만 월 단위로 노출.
   * periods가 있으면 타임라인 배너가 연결/재연결·해제 이력을 표시한다.
   */
  const connectionStartDate =
    firstAvailableMonth ??
    (connectionStartedAt != null ? parseDateKey(connectionStartedAt) : null) ??
    membershipConnectedAt;
  const showConnectionStartMessage =
    !hasPeriodBanners &&
    connectionStartDate != null &&
    isSameYearMonth(selectedMonth, connectionStartDate);
  const showAttendedUntilMessage =
    !hasPeriodBanners && isDisconnected && isSameYearMonth(selectedMonth, albumRangeEnd);

  /** 월 네비 하한: album firstAvailableMonth(전체 이력) > schools 최신 connectedAt */
  const minMonth = startOfMonth(
    firstAvailableMonth ?? membershipConnectedAt ?? selectedMonth
  );
  const maxMonth = startOfMonth(lastAvailableMonth ?? selectedMonth);
  /** 일자 선택 하한 — 최초 이용월 1일(connectionStartedAt) 우선 */
  const minDate = startOfDay(
    connectionStartedAt != null
      ? parseDateKey(connectionStartedAt)
      : (firstAvailableMonth ?? membershipConnectedAt ?? selectedMonth)
  );
  const maxDate = startOfDay(
    lastAvailableMonth
      ? new Date(lastAvailableMonth.getFullYear(), lastAvailableMonth.getMonth() + 1, 0)
      : albumRangeEnd
  );
  const dateSelectInitialDate = startOfDay(
    attendedUntil != null ? parseDateKey(attendedUntil) : new Date()
  );
  const canGoPrevMonth = compareYearMonth(selectedMonth, minMonth) > 0;
  const canGoNextMonth = compareYearMonth(selectedMonth, maxMonth) < 0;
  const albumPhotoDateKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const day of monthDays) {
      if (
        day.photoCount > 0 &&
        isAlbumDateInMembershipRange(day.dateKey) &&
        isAlbumDayAccessible(day)
      ) {
        keys.add(day.dateKey);
      }
    }
    if (
      !isDisconnected &&
      isAttendedToday &&
      todayPhotoCount > 0 &&
      isAlbumDateInMembershipRange(todayDateKey)
    ) {
      keys.add(todayDateKey);
    }
    return keys;
  }, [
    monthDays,
    isAlbumDayAccessible,
    isDisconnected,
    isAttendedToday,
    todayPhotoCount,
    todayDateKey,
    isAlbumDateInMembershipRange,
  ]);

  const isMonthListLoading =
    hasSelectedSchool && isAlbumMonthPending && monthDays.length === 0 && !isAlbumMonthError;

  const handleKindergartenSelect = useCallback(
    (kindergartenId: string) => {
      const next = kindergartens.find((item) => item.id === kindergartenId) ?? null;
      setSelectedKindergartenId(kindergartenId);
      setViewMode('all');
      setIsScrollTopVisible(false);
      if (next?.attendedUntil != null) {
        setSelectedMonth(startOfMonth(parseDateKey(next.attendedUntil)));
        return;
      }
      setSelectedMonth(startOfMonth(new Date()));
    },
    [kindergartens]
  );

  const handleKindergartenSelectClick = () => {
    if (!canSelectKindergarten) return;

    openAlbumOverlay(({ isOpen, close }) => (
      <KindergartenSelectSheet
        isOpen={isOpen}
        close={close}
        kindergartens={kindergartens}
        currentKindergartenId={resolvedKindergartenId}
        onSelect={handleKindergartenSelect}
      />
    ));
  };

  const handleFilterClick = () => {
    openAlbumOverlay(({ isOpen, close }) => (
      <GuardianAlbumFilterSheet
        isOpen={isOpen}
        close={close}
        currentViewMode={viewMode}
        onSelect={handleFilterSelect}
      />
    ));
  };

  const handleInfoClick = () => {
    openAlbumOverlay(({ isOpen, close }) => (
      <GuardianAlbumInfoSheet isOpen={isOpen} close={close} />
    ));
  };

  const handlePrevMonth = () => {
    if (!canGoPrevMonth) {
      toast({ title: content.monthNav.noMoreAlbumToast });
      return;
    }
    setSelectedMonth((prev) => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    if (!canGoNextMonth) {
      if (isDisconnected) {
        toast({ title: content.monthNav.attendedUntilToast });
      }
      return;
    }
    setSelectedMonth((prev) => addMonths(prev, 1));
  };

  const handleYearMonthClick = () => {
    openAlbumOverlay(({ isOpen, close }) => (
      <GuardianAlbumMonthPickerSheet
        isOpen={isOpen}
        close={close}
        currentMonth={selectedMonth}
        minMonth={minMonth}
        maxMonth={maxMonth}
        onConfirm={setSelectedMonth}
      />
    ));
  };

  const handleSearchClick = () => {
    openAlbumOverlay(({ isOpen, close }) => (
      <GuardianAlbumDateSelectSheet
        isOpen={isOpen}
        close={close}
        minDate={minDate}
        maxDate={maxDate}
        initialDate={dateSelectInitialDate}
        enabledDateKeys={albumPhotoDateKeys}
        markedDateKeys={albumPhotoDateKeys}
        onConfirm={handleOpenDateDetail}
      />
    ));
  };

  const handleScroll = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    setIsScrollTopVisible(node.scrollTop > 120);
  }, []);

  const handleScrollTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEntryRetry = useCallback(() => {
    if (isEntryRetrying) return;
    setIsEntryRetrying(true);
    Promise.all([refetchAlbumToday(), refetchAlbumMonth()]).finally(() => {
      setIsEntryRetrying(false);
    });
  }, [isEntryRetrying, refetchAlbumMonth, refetchAlbumToday]);

  if (!isReady) return null;

  const isEntryLoadError = isAlbumTodayError || searchParams.get('entryError') === '1';
  const showTodaySection = !isDisconnected && isAttendedToday && activeSchoolId === schoolId;

  const monthNav = (
    <GuardianAlbumMonthNav
      month={selectedMonth}
      canGoPrevMonth={canGoPrevMonth}
      canGoNextMonth={canGoNextMonth}
      onPrevMonth={handlePrevMonth}
      onNextMonth={handleNextMonth}
      onYearMonthClick={handleYearMonthClick}
      onSearchClick={handleSearchClick}
    />
  );

  const monthListBody = isMonthListLoading ? null : !hasMonthTimelineContent ? (
    <>
      {showAttendedUntilMessage ? (
        <p className='body1-medium text-text-secondary mt-5 px-4 py-4 text-center'>
          {content.history.attendedUntilMessage}
        </p>
      ) : null}
      <GuardianAlbumMonthEmpty />
      {showConnectionStartMessage ? (
        <div className='px-4'>
          <GuardianAlbumHistoryEmpty />
        </div>
      ) : null}
    </>
  ) : (
    <GuardianAlbumDayList
      timeline={monthTimeline}
      showConnectionStartMessage={showConnectionStartMessage}
      showAttendedUntilMessage={showAttendedUntilMessage}
      onDayClick={handleOpenDayDetail}
    />
  );

  return (
    <div className={`${isEntryLoadError ? 'bg-bg-0' : 'bg-bg-50'} relative flex min-h-0 flex-1 flex-col`}>
      <div className='bg-bg-0'>
        <Header>
          <Header.BackButton onClick={handleHeaderBack} />
          {canSelectKindergarten ? (
            <Header.CenterSection>
              <button
                type='button'
                className='h3-extrabold text-text-primary gap-x1 flex max-w-[200px] items-center'
                aria-label={content.kindergartenSelectAriaLabel}
                onClick={handleKindergartenSelectClick}
              >
                <span className='truncate'>{kindergartenName}</span>
                <Icon icon='ChevronBottom' className='text-text-primary size-5 shrink-0' aria-hidden='true' />
              </button>
            </Header.CenterSection>
          ) : (
            <Header.Title className='max-w-[200px] truncate'>{kindergartenName}</Header.Title>
          )}
          <Header.RightSection>
            <button
              type='button'
              className='inline-flex size-6 items-center justify-center'
              aria-label={content.filterAriaLabel}
              onClick={handleFilterClick}
            >
              <Icon
                icon='Filter'
                className={`size-6 ${viewMode === 'all' ? 'text-fill-secondary-700' : 'text-text-accent'}`}
              />
            </button>
            <button
              type='button'
              className='inline-flex size-6 items-center justify-center'
              aria-label={content.infoAriaLabel}
              onClick={handleInfoClick}
            >
              <Icon icon='InfoLine' className='text-fill-secondary-700 size-6' />
            </button>
          </Header.RightSection>
        </Header>
      </div>

      {isEntryLoadError ? (
        <PageError
          layout='inline'
          isRetrying={isEntryRetrying || isAlbumTodayFetching || isAlbumMonthFetching}
          onRetry={handleEntryRetry}
        />
      ) : hasSelectedSchool || hasAlbumHistory ? (
        isFilterMode && isFilterEmpty ? (
          <GuardianAlbumFilterEmpty viewMode={viewMode} onResetToAll={handleResetFilter} />
        ) : viewMode === 'favorite' ? (
          <>
            <GuardianAlbumFavoriteList
              days={visibleFavoriteDays}
              hasNextPage={hasFavoriteNextPage}
              isFetchingNextPage={isFavoriteFetchingNextPage}
              fetchNextPage={fetchFavoriteNextPage}
              onDayClick={handleOpenFilterDayDetail}
              scrollRef={scrollRef}
              onScrollVisibilityChange={setIsScrollTopVisible}
            />
            <GuardianAlbumScrollTopButton visible={isScrollTopVisible} onClick={handleScrollTop} />
          </>
        ) : viewMode === 'attendance' ? (
          <>
            <GuardianAlbumAttendanceList
              days={enrichedAttendanceDays}
              schoolId={activeSchoolId}
              hasNextPage={hasAttendanceNextPage}
              isFetchingNextPage={isAttendanceFetchingNextPage}
              fetchNextPage={fetchAttendanceNextPage}
              onDayClick={handleOpenFilterDayDetail}
              scrollRef={scrollRef}
              onScrollVisibilityChange={setIsScrollTopVisible}
            />
            <GuardianAlbumScrollTopButton visible={isScrollTopVisible} onClick={handleScrollTop} />
          </>
        ) : (
          <>
            {showTodaySection ? (
              <div
                ref={scrollRef}
                className='flex min-h-0 flex-1 flex-col overflow-y-auto pb-[calc(1.25rem+max(var(--safe-area-inset-bottom,0px),env(safe-area-inset-bottom,0px)))]'
                onScroll={handleScroll}
              >
                <GuardianAlbumTodaySection
                  petName={petName}
                  isAttendedToday={isAttendedToday}
                  todayPhotoCount={todayPhotoCount}
                  todayPhotos={todayPhotos}
                  lastViewedAt={lastViewedAt}
                  onOpenDetail={handleOpenTodayDetail}
                  onToggleFavorite={toggleFavorite}
                />
                <div className='sticky top-0 z-10'>{monthNav}</div>
                {monthListBody}
              </div>
            ) : (
              <>
                {monthNav}
                <div
                  ref={scrollRef}
                  className='flex min-h-0 flex-1 flex-col overflow-y-auto pb-[calc(1.25rem+max(var(--safe-area-inset-bottom,0px),env(safe-area-inset-bottom,0px)))]'
                  onScroll={handleScroll}
                >
                  {monthListBody}
                </div>
              </>
            )}
            <GuardianAlbumScrollTopButton visible={isScrollTopVisible} onClick={handleScrollTop} />
          </>
        )
      ) : (
        <div className='bg-bg-0 flex min-h-0 flex-1 flex-col'>
          <GuardianAlbumEmptyState />
        </div>
      )}

      {detailState ? (
        <GuardianAlbumPhotoDetail
          photos={detailState.photos}
          initialIndex={detailState.initialIndex}
          showListButton={detailState.showListButton}
          onClose={handleCloseDetail}
          onListClick={handleCloseDetail}
          onToggleFavorite={toggleFavorite}
        />
      ) : null}
    </div>
  );
}

export { GuardianAlbumPage };
