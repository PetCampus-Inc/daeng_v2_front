'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Icon } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import { MOCK_ALBUM_KINDERGARTENS } from '@views/guardian-album-page/config/guardianAlbumKindergartenMock';
import {
  MOCK_ALBUM_CONNECTION_STARTED_AT,
  compareYearMonth,
  createGuardianAlbumMonthMock,
  isSameYearMonth,
  parseDateKey,
} from '@views/guardian-album-page/config/guardianAlbumMonthMock';
import {
  MOCK_GUARDIAN_ALBUM_TODAY,
  createGuardianAlbumTodayPhotos,
} from '@views/guardian-album-page/config/guardianAlbumTodayMock';
import type { GuardianAlbumViewMode } from '@views/guardian-album-page/model/guardianAlbumViewMode';
import { GuardianAlbumDayList } from '@views/guardian-album-page/ui/GuardianAlbumDayList';
import { GuardianAlbumDateSelectSheet } from '@views/guardian-album-page/ui/GuardianAlbumDateSelectSheet';
import { GuardianAlbumEmptyState } from '@views/guardian-album-page/ui/GuardianAlbumEmptyState';
import { GuardianAlbumFilterSheet } from '@views/guardian-album-page/ui/GuardianAlbumFilterSheet';
import { GuardianAlbumInfoSheet } from '@views/guardian-album-page/ui/GuardianAlbumInfoSheet';
import { GuardianAlbumKindergartenSelectSheet } from '@views/guardian-album-page/ui/GuardianAlbumKindergartenSelectSheet';
import { GuardianAlbumMonthNav } from '@views/guardian-album-page/ui/GuardianAlbumMonthNav';
import { GuardianAlbumMonthPickerSheet } from '@views/guardian-album-page/ui/GuardianAlbumMonthPickerSheet';
import { GuardianAlbumScrollTopButton } from '@views/guardian-album-page/ui/GuardianAlbumScrollTopButton';
import { GuardianAlbumTodaySection } from '@views/guardian-album-page/ui/GuardianAlbumTodaySection';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';
import { Header } from '@widgets/Header';
import { startOfDay } from '@shared/lib/calendar-date';

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
  const canSelectKindergarten = kindergartens.length > 1;
  const defaultKindergartenId =
    kindergartens.find((item) => item.attendedUntil == null)?.id ?? kindergartens[0]?.id ?? null;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedKindergartenId, setSelectedKindergartenId] = useState<string | null>(
    defaultKindergartenId
  );
  const [viewMode, setViewMode] = useState<GuardianAlbumViewMode>('all');
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
  const [isScrollTopVisible, setIsScrollTopVisible] = useState(false);

  const selectedKindergarten =
    kindergartens.find((item) => item.id === selectedKindergartenId) ?? kindergartens[0] ?? null;
  const kindergartenName = selectedKindergarten?.name ?? '유치원';
  const petName = selectedPet?.name ?? '강아지';
  const todayPhotos = createGuardianAlbumTodayPhotos(
    albumToday.todayPhotoSeeds,
    selectedPet?.profileImage
  );

  const monthAlbum = useMemo(
    () =>
      createGuardianAlbumMonthMock(selectedMonth, selectedPet?.profileImage, new Date(), {
        includeTodayAsDayCard: !albumToday.isAttendedToday,
      }),
    [selectedMonth, selectedPet?.profileImage, albumToday.isAttendedToday]
  );

  const visibleDays = useMemo(() => {
    if (viewMode === 'attendance') {
      return monthAlbum.days.filter((day) => day.isAttended);
    }
    if (viewMode === 'favorite') {
      return monthAlbum.days.filter((day) => day.photos.some((photo) => photo.isBookmarked));
    }
    return monthAlbum.days;
  }, [monthAlbum.days, viewMode]);

  const showConnectionStartMessage = isSameYearMonth(
    selectedMonth,
    parseDateKey(monthAlbum.connectionStartedAt)
  );

  const minMonth = startOfMonth(parseDateKey(MOCK_ALBUM_CONNECTION_STARTED_AT));
  const maxMonth = startOfMonth(new Date());
  const minDate = startOfDay(parseDateKey(MOCK_ALBUM_CONNECTION_STARTED_AT));
  const maxDate = startOfDay(new Date());
  const canGoPrevMonth = compareYearMonth(selectedMonth, minMonth) > 0;
  const canGoNextMonth = compareYearMonth(selectedMonth, maxMonth) < 0;

  const handleKindergartenSelectClick = () => {
    if (!canSelectKindergarten) return;

    overlay.open(({ isOpen, close }) => (
      <GuardianAlbumKindergartenSelectSheet
        isOpen={isOpen}
        close={close}
        kindergartens={kindergartens}
        currentKindergartenId={selectedKindergartenId}
        onSelect={setSelectedKindergartenId}
      />
    ));
  };

  const handleFilterClick = () => {
    overlay.open(({ isOpen, close }) => (
      <GuardianAlbumFilterSheet
        isOpen={isOpen}
        close={close}
        currentViewMode={viewMode}
        onSelect={setViewMode}
      />
    ));
  };

  const handleInfoClick = () => {
    overlay.open(({ isOpen, close }) => <GuardianAlbumInfoSheet isOpen={isOpen} close={close} />);
  };

  const handlePrevMonth = () => {
    if (!canGoPrevMonth) return;
    setSelectedMonth((prev) => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    if (!canGoNextMonth) return;
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

  return (
    <div className='bg-bg-50 relative flex h-dvh flex-col'>
      <div className='bg-bg-0'>
        <Header>
          <Header.BackButton />
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
              <Icon icon='Filter' className='text-fill-secondary-700 size-6' />
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

      {albumToday.hasAlbumHistory ? (
        <>
          <div
            ref={scrollRef}
            className='min-h-0 flex-1 overflow-y-auto pb-5'
            onScroll={handleScroll}
          >
            {albumToday.isAttendedToday ? (
              <GuardianAlbumTodaySection
                petName={petName}
                isAttendedToday={albumToday.isAttendedToday}
                todayPhotoCount={albumToday.todayPhotoCount}
                todayPhotos={todayPhotos}
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
            <GuardianAlbumDayList
              days={visibleDays}
              showConnectionStartMessage={showConnectionStartMessage}
            />
          </div>
          <GuardianAlbumScrollTopButton visible={isScrollTopVisible} onClick={handleScrollTop} />
        </>
      ) : (
        <div className='bg-bg-0 flex min-h-0 flex-1 flex-col'>
          <GuardianAlbumEmptyState />
        </div>
      )}
    </div>
  );
}

export { GuardianAlbumPage };
