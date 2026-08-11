'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import { MOCK_ALBUM_KINDERGARTENS } from '@views/guardian-album-page/config/guardianAlbumKindergartenMock';
import {
  MOCK_ALBUM_CONNECTION_STARTED_AT,
  compareYearMonth,
  createGuardianAlbumMonthMock,
  createGuardianAlbumPhotoDateKeys,
  isSameYearMonth,
  parseDateKey,
  toDateKey,
  type GuardianAlbumDayAlbum,
} from '@views/guardian-album-page/config/guardianAlbumMonthMock';
import {
  MOCK_GUARDIAN_ALBUM_TODAY,
  createGuardianAlbumTodayPhotos,
  type GuardianAlbumPhoto,
} from '@views/guardian-album-page/config/guardianAlbumTodayMock';
import type { GuardianAlbumViewMode } from '@views/guardian-album-page/model/guardianAlbumViewMode';
import { expandGuardianAlbumPhotos } from '@views/guardian-album-page/lib/expandGuardianAlbumPhotos';
import { GuardianAlbumDayList } from '@views/guardian-album-page/ui/GuardianAlbumDayList';
import { GuardianAlbumDateSelectSheet } from '@views/guardian-album-page/ui/GuardianAlbumDateSelectSheet';
import { GuardianAlbumEmptyState } from '@views/guardian-album-page/ui/GuardianAlbumEmptyState';
import { GuardianAlbumEntryError } from '@views/guardian-album-page/ui/GuardianAlbumEntryError';
import { hasGuardianAlbumAttendancePhotos } from '@views/guardian-album-page/config/guardianAlbumAttendanceMock';
import { hasGuardianAlbumFavoritePhotos } from '@views/guardian-album-page/config/guardianAlbumFavoriteMock';
import { GuardianAlbumAttendanceList } from '@views/guardian-album-page/ui/GuardianAlbumAttendanceList';
import { GuardianAlbumFavoriteList } from '@views/guardian-album-page/ui/GuardianAlbumFavoriteList';
import { GuardianAlbumFilterEmpty } from '@views/guardian-album-page/ui/GuardianAlbumFilterEmpty';
import { GuardianAlbumFilterSheet } from '@views/guardian-album-page/ui/GuardianAlbumFilterSheet';
import { GuardianAlbumHistoryEmpty } from '@views/guardian-album-page/ui/GuardianAlbumHistoryEmpty';
import { GuardianAlbumInfoSheet } from '@views/guardian-album-page/ui/GuardianAlbumInfoSheet';
import { GuardianAlbumKindergartenSelectSheet } from '@views/guardian-album-page/ui/GuardianAlbumKindergartenSelectSheet';
import { GuardianAlbumMonthNav } from '@views/guardian-album-page/ui/GuardianAlbumMonthNav';
import { GuardianAlbumMonthEmpty } from '@views/guardian-album-page/ui/GuardianAlbumMonthEmpty';
import { GuardianAlbumMonthPickerSheet } from '@views/guardian-album-page/ui/GuardianAlbumMonthPickerSheet';
import { GuardianAlbumPhotoDetail } from '@views/guardian-album-page/ui/GuardianAlbumPhotoDetail';
import { GuardianAlbumScrollTopButton } from '@views/guardian-album-page/ui/GuardianAlbumScrollTopButton';
import { GuardianAlbumTodaySection } from '@views/guardian-album-page/ui/GuardianAlbumTodaySection';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';
import { Header } from '@widgets/Header';
import { useStackNavigation } from '@shared/lib/bridge';
import { startOfDay } from '@shared/lib/calendar-date';
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

function GuardianAlbumPage() {
  const content = guardianAlbumContent;
  const kindergartens = MOCK_ALBUM_KINDERGARTENS;
  const albumToday = MOCK_GUARDIAN_ALBUM_TODAY;
  const { selectedPet } = useGuardianSelectedPet();
  const { back } = useStackNavigation();
  const searchParams = useSearchParams();
  const canSelectKindergarten = kindergartens.length > 1;
  const defaultKindergartenId =
    kindergartens.find((item) => item.attendedUntil == null)?.id ?? kindergartens[0]?.id ?? null;

  const scrollRef = useRef<HTMLDivElement>(null);
  const didOpenHomeDetailRef = useRef(false);
  const [selectedKindergartenId, setSelectedKindergartenId] = useState<string | null>(
    defaultKindergartenId
  );
  const [viewMode, setViewMode] = useState<GuardianAlbumViewMode>('all');
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
  const [isScrollTopVisible, setIsScrollTopVisible] = useState(false);
  const [detailState, setDetailState] = useState<GuardianAlbumDetailState | null>(null);
  const [isEntryLoadError, setIsEntryLoadError] = useState(
    () => albumToday.hasEntryLoadError || searchParams.get('entryError') === '1'
  );
  const [isEntryRetrying, setIsEntryRetrying] = useState(false);

  const selectedKindergarten =
    kindergartens.find((item) => item.id === selectedKindergartenId) ?? kindergartens[0] ?? null;
  const kindergartenName = selectedKindergarten?.name ?? '유치원';
  const petName = selectedPet?.name ?? '강아지';
  const attendedUntil = selectedKindergarten?.attendedUntil ?? null;
  const isDisconnected = attendedUntil != null;
  const albumRangeEnd = useMemo(
    () => (attendedUntil != null ? parseDateKey(attendedUntil) : new Date()),
    [attendedUntil]
  );
  const todayPhotos = createGuardianAlbumTodayPhotos(
    albumToday.todayPhotoSeeds,
    selectedPet?.profileImage
  );
  const todayDetailPhotos = useMemo(
    () => expandGuardianAlbumPhotos(todayPhotos, albumToday.todayPhotoCount),
    [todayPhotos, albumToday.todayPhotoCount]
  );

  const monthAlbum = useMemo(
    () =>
      createGuardianAlbumMonthMock(selectedMonth, selectedPet?.profileImage, albumRangeEnd, {
        includeTodayAsDayCard: isDisconnected || !albumToday.isAttendedToday,
        unattendedRangeEnd: !isDisconnected && !albumToday.isAttendedToday,
      }),
    [
      selectedMonth,
      selectedPet?.profileImage,
      albumRangeEnd,
      isDisconnected,
      albumToday.isAttendedToday,
    ]
  );

  const visibleDays = monthAlbum.days;

  const hasFavoritePhotos = useMemo(
    () => hasGuardianAlbumFavoritePhotos(selectedPet?.profileImage, albumRangeEnd),
    [selectedPet?.profileImage, albumRangeEnd]
  );
  const hasAttendancePhotos = useMemo(
    () => hasGuardianAlbumAttendancePhotos(selectedPet?.profileImage, albumRangeEnd),
    [selectedPet?.profileImage, albumRangeEnd]
  );

  const isFilterEmpty =
    (viewMode === 'attendance' && !hasAttendancePhotos) ||
    (viewMode === 'favorite' && !hasFavoritePhotos);

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
    setDetailState(null);
  }, []);

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

  useEffect(() => {
    if (didOpenHomeDetailRef.current) return;
    if (searchParams.get('from') !== 'home') return;
    if (!albumToday.hasAlbumHistory || todayDetailPhotos.length === 0) return;

    didOpenHomeDetailRef.current = true;
    openDetail(todayDetailPhotos, undefined, true);
  }, [albumToday.hasAlbumHistory, openDetail, searchParams, todayDetailPhotos]);

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

  const showConnectionStartMessage = isSameYearMonth(
    selectedMonth,
    parseDateKey(monthAlbum.connectionStartedAt)
  );
  const showAttendedUntilMessage =
    isDisconnected && isSameYearMonth(selectedMonth, albumRangeEnd);

  const minMonth = startOfMonth(parseDateKey(MOCK_ALBUM_CONNECTION_STARTED_AT));
  const maxMonth = startOfMonth(albumRangeEnd);
  const minDate = startOfDay(parseDateKey(MOCK_ALBUM_CONNECTION_STARTED_AT));
  const maxDate = startOfDay(albumRangeEnd);
  const canGoPrevMonth = compareYearMonth(selectedMonth, minMonth) > 0;
  const canGoNextMonth = compareYearMonth(selectedMonth, maxMonth) < 0;
  const albumPhotoDateKeys = useMemo(() => {
    const keys = createGuardianAlbumPhotoDateKeys(albumRangeEnd, {
      includeTodayAsDayCard: isDisconnected || !albumToday.isAttendedToday,
    });
    if (!isDisconnected && albumToday.isAttendedToday && albumToday.todayPhotoCount > 0) {
      keys.add(toDateKey(new Date()));
    }
    return keys;
  }, [albumRangeEnd, isDisconnected, albumToday.isAttendedToday, albumToday.todayPhotoCount]);

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
      <GuardianAlbumKindergartenSelectSheet
        isOpen={isOpen}
        close={close}
        kindergartens={kindergartens}
        currentKindergartenId={selectedKindergartenId}
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
        initialDate={selectedMonth}
        enabledDateKeys={albumPhotoDateKeys}
        onConfirm={(date) => {
          setSelectedMonth(startOfMonth(date));
        }}
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
    // API 연동 전: 재시도 시 mock 성공 복구. 연동 후 refetch로 교체.
    window.setTimeout(() => {
      setIsEntryLoadError(false);
      setIsEntryRetrying(false);
    }, 400);
  }, [isEntryRetrying]);

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
        <GuardianAlbumEntryError isRetrying={isEntryRetrying} onRetry={handleEntryRetry} />
      ) : albumToday.hasAlbumHistory ? (
        isFilterMode && isFilterEmpty ? (
          <GuardianAlbumFilterEmpty viewMode={viewMode} onResetToAll={handleResetFilter} />
        ) : viewMode === 'favorite' ? (
          <>
            <GuardianAlbumFavoriteList
              profileImage={selectedPet?.profileImage}
              rangeEnd={albumRangeEnd}
              scrollRef={scrollRef}
              onScrollVisibilityChange={setIsScrollTopVisible}
            />
            <GuardianAlbumScrollTopButton visible={isScrollTopVisible} onClick={handleScrollTop} />
          </>
        ) : viewMode === 'attendance' ? (
          <>
            <GuardianAlbumAttendanceList
              profileImage={selectedPet?.profileImage}
              rangeEnd={albumRangeEnd}
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
              {!isDisconnected && albumToday.isAttendedToday ? (
                <GuardianAlbumTodaySection
                  petName={petName}
                  isAttendedToday={albumToday.isAttendedToday}
                  todayPhotoCount={albumToday.todayPhotoCount}
                  todayPhotos={todayPhotos}
                  onOpenDetail={handleOpenTodayDetail}
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
              {monthAlbum.days.length === 0 ? (
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
        />
      ) : null}
    </div>
  );
}

export { GuardianAlbumPage };
