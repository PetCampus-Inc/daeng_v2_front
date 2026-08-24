'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import {
  useGuardianSchoolConnectionsQuery,
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
import { GuardianAlbumDayList } from '@views/guardian-album-page/ui/GuardianAlbumDayList';
import { GuardianAlbumDateSelectSheet } from '@views/guardian-album-page/ui/GuardianAlbumDateSelectSheet';
import { GuardianAlbumEmptyState } from '@views/guardian-album-page/ui/GuardianAlbumEmptyState';
import { useGuardianAlbumAttendedDays } from '@views/guardian-album-page/model/useGuardianAlbumAttendedDays';
import { useGuardianAlbumFavorites } from '@views/guardian-album-page/model/useGuardianAlbumFavorites';
import { useGuardianAlbumFavoriteToggle } from '@views/guardian-album-page/model/useGuardianAlbumFavoriteToggle';
import { useGuardianAlbumLastViewed } from '@views/guardian-album-page/model/useGuardianAlbumLastViewed';
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
import { useStackNavigation } from '@shared/lib/bridge';
import { formatDateKey, startOfDay } from '@shared/lib/calendar-date';
import { KindergartenSelectSheet } from '@shared/ui/kindergarten-select-sheet';
import { PageError } from '@shared/ui/page-error';
import { toast } from '@shared/ui/toast';

interface GuardianAlbumDetailState {
  photos: GuardianAlbumPhoto[];
  initialIndex: number;
  showListButton: boolean;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
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
  const { lastViewedAt, markAsViewed } = useGuardianAlbumLastViewed();
  const [selectedKindergartenId, setSelectedKindergartenId] = useState<string | null>(null);
  const userId = useUserStore((state) => state.user?.userId);
  const { selectedPetId: earlySelectedPetId } = useGuardianSelectedPet();
  const { data: connections } = useGuardianSchoolConnectionsQuery({
    userId,
    petId: earlySelectedPetId,
    enabled: Boolean(userId) && Boolean(earlySelectedPetId),
  });
  const selectedOptionSchoolId = useMemo(() => {
    if (!selectedKindergartenId) return null;
    const matched = (connections ?? []).find(
      (connection) =>
        connection.id === selectedKindergartenId || connection.schoolId === selectedKindergartenId
    );
    return matched?.schoolId ?? selectedKindergartenId;
  }, [connections, selectedKindergartenId]);
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
  const searchParams = useSearchParams();

  const scrollRef = useRef<HTMLDivElement>(null);
  const didOpenHomeDetailRef = useRef(false);
  const [viewMode, setViewMode] = useState<GuardianAlbumViewMode>('all');
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
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
  const selectedKindergarten =
    kindergartens.find((item) => item.id === (selectedKindergartenId ?? defaultKindergartenId)) ??
    kindergartens[0] ??
    null;
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
  /** membership 연결일 — 일자 캘린더 하한 (firstAvailableMonth 1일 대체) */
  const membershipConnectedAt = useMemo(
    () =>
      selectedConnection?.connectedAt ? startOfDay(selectedConnection.connectedAt) : null,
    [selectedConnection]
  );

  const {
    days: monthDays,
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
    hasFavoritePhotos,
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
    hasAttendancePhotos,
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
  const visibleDays = useMemo<GuardianAlbumDayAlbum[]>(() => {
    const hideTodayInList = !isDisconnected && isAttendedToday;
    return monthDays.filter((day) => !(hideTodayInList && day.dateKey === todayDateKey));
  }, [monthDays, isDisconnected, isAttendedToday, todayDateKey]);

  const enrichedAttendanceDays = useMemo(() => {
    const monthByDate = new Map(monthDays.map((day) => [day.dateKey, day] as const));
    return attendanceDays.map((day) =>
      mergeGuardianAlbumDayPhotos(day, monthByDate.get(day.dateKey) ?? null)
    );
  }, [attendanceDays, monthDays]);

  const hasAttendancePhotosReady = !isAttendancePending || attendanceDays.length > 0;
  const hasFavoritePhotosReady = !isFavoritePending || favoriteDays.length > 0;

  const isFilterEmpty =
    (viewMode === 'attendance' && hasAttendancePhotosReady && !hasAttendancePhotos) ||
    (viewMode === 'favorite' && hasFavoritePhotosReady && !hasFavoritePhotos);

  const isFilterMode = viewMode === 'favorite' || viewMode === 'attendance';

  const openDetail = useCallback(
    (photos: GuardianAlbumPhoto[], photoId?: string, showListButton = false) => {
      if (photos.length === 0) return;
      const foundIndex = photoId ? photos.findIndex((photo) => photo.id === photoId) : 0;
      setDetailState({
        photos,
        initialIndex: foundIndex >= 0 ? foundIndex : 0,
        showListButton,
      });
    },
    []
  );

  const handleCloseDetail = useCallback(() => {
    markAsViewed();
    setDetailState(null);
  }, [markAsViewed]);

  const handleOpenTodayDetail = useCallback(
    (photoId?: string) => {
      openDetail(todayDetailPhotos, photoId, false);
    },
    [openDetail, todayDetailPhotos]
  );

  const handleOpenDayDetail = useCallback(
    (dayAlbum: GuardianAlbumDayAlbum) => {
      if (dayAlbum.hasLoadError) return;
      const photos = expandGuardianAlbumPhotos(dayAlbum.photos, dayAlbum.photoCount);
      openDetail(photos, undefined, false);
    },
    [openDetail]
  );

  const handleOpenFilterDayDetail = useCallback(
    async (day: GuardianAlbumFilterDay) => {
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
    [openDetail, activeSchoolId, viewMode]
  );

  /** 날짜 검색 시트 — 선택일 상세 슬라이드 진입 */
  const handleOpenDateDetail = useCallback(
    async (date: Date) => {
      const dateKey = toDateKey(date);
      setSelectedMonth(startOfMonth(date));
      setIsScrollTopVisible(false);

      if (dateKey === todayDateKey && todayDetailPhotos.length > 0) {
        openDetail(todayDetailPhotos, undefined, false);
        return;
      }

      const monthDay = monthDays.find((day) => day.dateKey === dateKey) ?? null;

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
    if (!hasAlbumHistory || todayDetailPhotos.length === 0) return;

    didOpenHomeDetailRef.current = true;
    openDetail(todayDetailPhotos, undefined, true);
  }, [hasAlbumHistory, openDetail, searchParams, todayDetailPhotos]);

  const handleResetFilter = useCallback(() => {
    setViewMode('all');
    setIsScrollTopVisible(false);
  }, []);

  const handleHeaderBack = useCallback(() => {
    if (viewMode === 'favorite' || viewMode === 'attendance') {
      handleResetFilter();
      return;
    }
    back();
  }, [back, handleResetFilter, viewMode]);

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
   * 첫 등원 월 하단 문구.
   * `connectionStartedAt`은 firstAvailableMonth→1일이라 membership connectedAt을 우선.
   */
  const connectionStartDate =
    membershipConnectedAt ??
    (connectionStartedAt != null ? parseDateKey(connectionStartedAt) : null);
  const showConnectionStartMessage =
    connectionStartDate != null && isSameYearMonth(selectedMonth, connectionStartDate);
  const showAttendedUntilMessage =
    isDisconnected && isSameYearMonth(selectedMonth, albumRangeEnd);

  const minMonth = startOfMonth(firstAvailableMonth ?? selectedMonth);
  const maxMonth = startOfMonth(lastAvailableMonth ?? selectedMonth);
  /**
   * 일자 선택 하한.
   * `firstAvailableMonth`는 연·월만 오므로 1일로 쓰면 안 된다 → membership connectedAt 우선.
   */
  const minDate = startOfDay(
    membershipConnectedAt ??
      (connectionStartedAt != null ? parseDateKey(connectionStartedAt) : selectedMonth)
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
      if (day.photoCount > 0) keys.add(day.dateKey);
    }
    if (!isDisconnected && isAttendedToday && todayPhotoCount > 0) {
      keys.add(todayDateKey);
    }
    return keys;
  }, [monthDays, isDisconnected, isAttendedToday, todayPhotoCount, todayDateKey]);

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

    overlay.open(({ isOpen, close }) => (
      <KindergartenSelectSheet
        isOpen={isOpen}
        close={close}
        kindergartens={kindergartens}
        currentKindergartenId={selectedKindergartenId ?? defaultKindergartenId}
        onSelect={handleKindergartenSelect}
      />
    ));
  };

  const handleFilterClick = () => {
    overlay.open(({ isOpen, close }) => (
      <GuardianAlbumFilterSheet
        isOpen={isOpen}
        close={close}
        currentViewMode={viewMode}
        onSelect={handleFilterSelect}
      />
    ));
  };

  const handleInfoClick = () => {
    overlay.open(({ isOpen, close }) => <GuardianAlbumInfoSheet isOpen={isOpen} close={close} />);
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
    overlay.open(({ isOpen, close }) => (
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
    overlay.open(({ isOpen, close }) => (
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

  return (
    <div className={`${isEntryLoadError ? 'bg-bg-0' : 'bg-bg-50'} relative flex h-dvh flex-col`}>
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
              days={favoriteDays}
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
            <div
              ref={scrollRef}
              className='flex min-h-0 flex-1 flex-col overflow-y-auto pb-5'
              onScroll={handleScroll}
            >
              {!isDisconnected && isAttendedToday && activeSchoolId === schoolId ? (
                <GuardianAlbumTodaySection
                  petName={petName}
                  isAttendedToday={isAttendedToday}
                  todayPhotoCount={todayPhotoCount}
                  todayPhotos={todayPhotos}
                  lastViewedAt={lastViewedAt}
                  onOpenDetail={handleOpenTodayDetail}
                  onToggleFavorite={toggleFavorite}
                />
              ) : null}
              <GuardianAlbumMonthNav
                month={selectedMonth}
                canGoPrevMonth={canGoPrevMonth}
                canGoNextMonth={canGoNextMonth}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onYearMonthClick={handleYearMonthClick}
                onSearchClick={handleSearchClick}
              />
              {isMonthListLoading ? null : visibleDays.length === 0 ? (
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
                  days={visibleDays}
                  showConnectionStartMessage={showConnectionStartMessage}
                  showAttendedUntilMessage={showAttendedUntilMessage}
                  onDayClick={handleOpenDayDetail}
                />
              )}
            </div>
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
