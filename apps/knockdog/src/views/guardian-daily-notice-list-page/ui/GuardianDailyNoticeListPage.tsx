'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { GuardianAlbumMonthPickerSheet } from '@views/guardian-album-page/ui/GuardianAlbumMonthPickerSheet';
import { GuardianAlbumScrollTopButton } from '@views/guardian-album-page/ui/GuardianAlbumScrollTopButton';
import { guardianDailyNoticeListContent } from '@views/guardian-daily-notice-list-page/config/guardianDailyNoticeListContent';
import { isDisconnectedListMock } from '@views/guardian-daily-notice-list-page/config/guardianDailyNoticeListMock';
import { useGuardianDailyNoticeMonthList } from '@views/guardian-daily-notice-list-page/model/useGuardianDailyNoticeMonthList';
import { GuardianDailyNoticeListMonthEmpty } from '@views/guardian-daily-notice-list-page/ui/GuardianDailyNoticeListMonthEmpty';
import { GuardianDailyNoticeListMonthList } from '@views/guardian-daily-notice-list-page/ui/GuardianDailyNoticeListMonthList';
import { GuardianDailyNoticeListMonthNav } from '@views/guardian-daily-notice-list-page/ui/GuardianDailyNoticeListMonthNav';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';
import { useGuardianKindergartenHome } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenHome';
import { pushGuardianDailyNoticeDetail } from '@views/guardian-kindergarten-page/lib/pushGuardianDailyNoticeDetail';
import { Header } from '@widgets/Header';
import { BOTTOM_BAR_HEIGHT } from '@shared/constants';
import { useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { addMonths, startOfDay } from '@shared/lib/calendar-date';
import {
  KindergartenSelectSheet,
  MOCK_KINDERGARTEN_SELECT_OPTIONS,
} from '@shared/ui/kindergarten-select-sheet';
import { toast } from '@shared/ui/toast';

function startOfMonth(date: Date) {
  return startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
}

function parseMonthQuery(value: string | null) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null;
  const [yearPart, monthPart] = value.split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return null;
  return startOfMonth(new Date(year, month - 1, 1));
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-');
  return startOfDay(new Date(Number(year), Number(month) - 1, Number(day)));
}

function GuardianDailyNoticeListPage() {
  const content = guardianDailyNoticeListContent;
  const searchParams = useSearchParams();
  const { navigateToTab } = useTabNavigation();
  const { push } = useStackNavigation();
  const { selectedPetId } = useGuardianSelectedPet();
  const { firstAttendedAt, linkedKindergarten, status } = useGuardianKindergartenHome();

  /** API 연동 전 헤더 전환/해제 UI 확인용 — 재원 중 항목은 현재 연결 유치원으로 치환 */
  const kindergartens = useMemo(() => {
    if (!linkedKindergarten) return MOCK_KINDERGARTEN_SELECT_OPTIONS;
    return MOCK_KINDERGARTEN_SELECT_OPTIONS.map((item) =>
      item.attendedUntil == null
        ? {
            ...item,
            id: linkedKindergarten.id,
            name: linkedKindergarten.name,
            imageUrl: linkedKindergarten.imageUrl || item.imageUrl,
          }
        : item
    );
  }, [linkedKindergarten]);
  const canSelectKindergarten = kindergartens.length > 1;
  const defaultKindergartenId =
    kindergartens.find((item) => item.attendedUntil == null)?.id ?? kindergartens[0]?.id ?? null;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedKindergartenId, setSelectedKindergartenId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    () => parseMonthQuery(searchParams.get('month')) ?? startOfMonth(new Date())
  );
  const [isScrollTopVisible, setIsScrollTopVisible] = useState(false);

  const resolvedKindergartenId =
    selectedKindergartenId ??
    defaultKindergartenId;
  const selectedKindergarten =
    kindergartens.find((item) => item.id === resolvedKindergartenId) ??
    kindergartens[0] ??
    null;
  const selectedAttendedUntilKey = selectedKindergarten?.attendedUntil ?? null;
  const selectedAttendedUntil = useMemo(
    () => (selectedAttendedUntilKey ? parseDateKey(selectedAttendedUntilKey) : null),
    [selectedAttendedUntilKey]
  );

  const isDisconnected =
    status === 'disconnected' ||
    isDisconnectedListMock(searchParams.get('mock')) ||
    selectedAttendedUntil != null;

  const { items, firstAttendanceDate, attendedUntilDate, effectiveFirstAttendedAt, isPending } =
    useGuardianDailyNoticeMonthList({
      schoolId: linkedKindergarten?.id,
      petId: selectedPetId,
      selectedMonth,
      firstAttendedAt,
      attendedUntil: selectedAttendedUntil,
      isDisconnected,
    });

  const minMonth = useMemo(
    () => startOfMonth(effectiveFirstAttendedAt ?? firstAttendedAt ?? new Date(2020, 0, 1)),
    [effectiveFirstAttendedAt, firstAttendedAt]
  );
  const maxMonth = useMemo(
    () => startOfMonth(selectedAttendedUntil ?? new Date()),
    [selectedAttendedUntil]
  );
  /** 첫 등원 블록이 뜬 달이면 더 이전은 볼 게 없음 (firstAttendedAt 미제공 시 하한 역할) */
  const isFirstAttendanceMonth = firstAttendanceDate != null;
  const canGoPrevMonth =
    selectedMonth.getTime() > minMonth.getTime() && !isFirstAttendanceMonth;
  const canGoNextMonth = selectedMonth.getTime() < maxMonth.getTime();

  const title =
    selectedAttendedUntil != null
      ? (selectedKindergarten?.name ?? '')
      : (linkedKindergarten?.name ?? selectedKindergarten?.name ?? '');

  const hasRows =
    items.length > 0 || firstAttendanceDate != null || attendedUntilDate != null;

  const handleBack = () => {
    navigateToTab('/compare');
  };

  const handleKindergartenSelect = useCallback(
    (kindergartenId: string) => {
      const next = kindergartens.find((item) => item.id === kindergartenId) ?? null;
      setSelectedKindergartenId(kindergartenId);
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
        currentKindergartenId={resolvedKindergartenId}
        onSelect={handleKindergartenSelect}
      />
    ));
  };

  const handleScroll = () => {
    const node = scrollRef.current;
    if (!node) return;
    setIsScrollTopVisible(node.scrollTop > 120);
  };

  const handleScrollTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevMonth = () => {
    if (!canGoPrevMonth) {
      const { noMoreNoticeToastPrefix, noMoreNoticeToastAccent, noMoreNoticeToastSuffix } =
        content.monthNav;
      toast({
        nativeTitle: `${noMoreNoticeToastPrefix}${noMoreNoticeToastAccent}${noMoreNoticeToastSuffix}`,
        titleParts: [
          { text: noMoreNoticeToastPrefix },
          { text: noMoreNoticeToastAccent, accent: true },
          { text: noMoreNoticeToastSuffix },
        ],
        title: (
          <>
            <span className='body1-medium text-text-primary-inverse'>
              {noMoreNoticeToastPrefix}
            </span>
            <span className='body1-bold text-text-accent'>{noMoreNoticeToastAccent}</span>
            <span className='body1-medium text-text-primary-inverse'>
              {noMoreNoticeToastSuffix}
            </span>
          </>
        ),
      });
      return;
    }
    setSelectedMonth((prev) => startOfMonth(addMonths(prev, -1)));
    setIsScrollTopVisible(false);
  };

  const handleNextMonth = () => {
    if (!canGoNextMonth) {
      toast({ title: content.monthNav.maxMonthToast });
      return;
    }
    setSelectedMonth((prev) => startOfMonth(addMonths(prev, 1)));
    setIsScrollTopVisible(false);
  };

  const handleYearMonthClick = () => {
    overlay.open(({ isOpen, close }) => (
      <GuardianAlbumMonthPickerSheet
        isOpen={isOpen}
        close={close}
        currentMonth={selectedMonth}
        minMonth={minMonth}
        maxMonth={maxMonth}
        onConfirm={(month) => {
          setSelectedMonth(startOfMonth(month));
          setIsScrollTopVisible(false);
        }}
      />
    ));
  };

  return (
    <div
      className='bg-bg-50 relative flex h-dvh flex-col'
      style={{ paddingBottom: BOTTOM_BAR_HEIGHT }}
    >
      <div className='sticky top-0 z-10 shrink-0'>
        <div className='bg-bg-0 pt-(--safe-area-inset-top,0px)'>
          <Header className='border-b-0'>
            <Header.LeftSection>
              <Header.BackButton onClick={handleBack} />
            </Header.LeftSection>
            {canSelectKindergarten ? (
              <Header.CenterSection>
                <button
                  type='button'
                  className='h3-extrabold text-text-primary gap-x1 flex max-w-[200px] items-center'
                  aria-label={content.kindergartenSelectAriaLabel}
                  onClick={handleKindergartenSelectClick}
                >
                  <span className='truncate'>{title}</span>
                  <Icon
                    icon='ChevronBottom'
                    className='text-text-primary size-5 shrink-0'
                    aria-hidden='true'
                  />
                </button>
              </Header.CenterSection>
            ) : (
              <Header.Title className='max-w-[200px] truncate'>{title}</Header.Title>
            )}
          </Header>
        </div>

        <GuardianDailyNoticeListMonthNav
          month={selectedMonth}
          canGoPrevMonth={canGoPrevMonth}
          canGoNextMonth={canGoNextMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onYearMonthClick={handleYearMonthClick}
        />
      </div>

      <div className='relative min-h-0 flex-1'>
        <div
          ref={scrollRef}
          className='bg-bg-50 flex h-full flex-col overflow-y-auto'
          onScroll={handleScroll}
          aria-label={content.listAriaLabel}
        >
          {isPending && !hasRows ? null : hasRows ? (
            <GuardianDailyNoticeListMonthList
              items={items}
              attendedUntilDate={attendedUntilDate}
              firstAttendanceDate={firstAttendanceDate}
              onItemClick={(item) => pushGuardianDailyNoticeDetail(push, item.date)}
            />
          ) : (
            <GuardianDailyNoticeListMonthEmpty />
          )}
        </div>
        <GuardianAlbumScrollTopButton
          visible={isScrollTopVisible}
          onClick={handleScrollTop}
        />
      </div>
    </div>
  );
}

export { GuardianDailyNoticeListPage };
