'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { useGuardianSchoolConnectionsQuery } from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
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
import {
  toKindergartenSelectOptions,
  toKindergartenSelectOptionsFromConnections,
  toMembershipIdBySchoolId,
  toMonthEndDateKey,
} from '@views/guardian-kindergarten-page/model/toKindergartenSelectOptions';
import { pushGuardianDailyNoticeDetail } from '@views/guardian-kindergarten-page/lib/pushGuardianDailyNoticeDetail';
import { Header } from '@widgets/Header';
import { BOTTOM_BAR_HEIGHT } from '@shared/constants';
import { useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { addMonths, startOfDay } from '@shared/lib/calendar-date';
import { KindergartenSelectSheet } from '@shared/ui/kindergarten-select-sheet';
import { RingLoadingSpinner } from '@shared/ui/loading-spinner';
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
  const { selectedPetId, isPetsReady } = useGuardianSelectedPet();
  const { firstAttendedAt, linkedKindergarten, status } = useGuardianKindergartenHome();
  const userId = useUserStore((state) => state.user?.userId);
  const { data: connections } = useGuardianSchoolConnectionsQuery({
    userId,
    petId: selectedPetId,
    enabled: Boolean(userId) && Boolean(selectedPetId),
  });
  const isMockMode = isDisconnectedListMock(searchParams.get('mock'));

  const isDisconnected = status === 'disconnected' || isMockMode;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedKindergartenId, setSelectedKindergartenId] = useState<string | null>(null);
  const [requestedMonth, setRequestedMonth] = useState(
    () => parseMonthQuery(searchParams.get('month')) ?? startOfMonth(new Date())
  );
  const [isScrollTopVisible, setIsScrollTopVisible] = useState(false);

  const disconnectedUntilKey = isDisconnected ? toMonthEndDateKey(new Date()) : null;

  /** 연결 이력 다건. 없으면 home 현재 연결 1건 */
  const kindergartens = useMemo(() => {
    const fromConnections = toKindergartenSelectOptionsFromConnections(connections ?? []);
    if (fromConnections.length > 0) return fromConnections;
    return toKindergartenSelectOptions(linkedKindergarten, disconnectedUntilKey);
  }, [connections, disconnectedUntilKey, linkedKindergarten]);
  const canSelectKindergarten = kindergartens.length > 1;
  const defaultKindergartenId =
    kindergartens.find((item) => item.attendedUntil == null)?.id ?? kindergartens[0]?.id ?? null;

  const resolvedKindergartenId = selectedKindergartenId ?? defaultKindergartenId;
  const selectedKindergarten =
    kindergartens.find((item) => item.id === resolvedKindergartenId) ??
    kindergartens[0] ??
    null;
  const selectedAttendedUntilKey = selectedKindergarten?.attendedUntil ?? null;
  const selectedAttendedUntil = useMemo(
    () => (selectedAttendedUntilKey ? parseDateKey(selectedAttendedUntilKey) : null),
    [selectedAttendedUntilKey]
  );
  const selectedMembershipId = useMemo(
    () => toMembershipIdBySchoolId(connections ?? [], selectedKindergarten?.id ?? null, selectedAttendedUntilKey),
    [connections, selectedAttendedUntilKey, selectedKindergarten?.id]
  );
  const isSelectedDisconnected = selectedAttendedUntil != null || isDisconnected;

  const {
    items,
    firstAttendanceDate,
    attendedUntilDate,
    effectiveFirstAttendedAt,
    lastAvailableMonth,
    isFirstAttendanceDateFallback,
    isPending,
  } = useGuardianDailyNoticeMonthList({
    membershipId: selectedMembershipId,
    petId: selectedPetId,
    selectedMonth: requestedMonth,
    firstAttendedAt,
    attendedUntil: selectedAttendedUntil,
    isDisconnected: isSelectedDisconnected,
    isPetsReady,
  });

  const selectedMonth = useMemo(() => {
    if (!isSelectedDisconnected || !lastAvailableMonth) return requestedMonth;
    const cap = startOfMonth(lastAvailableMonth);
    return requestedMonth.getTime() > cap.getTime() ? cap : requestedMonth;
  }, [isSelectedDisconnected, lastAvailableMonth, requestedMonth]);

  const minMonth = useMemo(
    () => startOfMonth(effectiveFirstAttendedAt ?? firstAttendedAt ?? new Date(2020, 0, 1)),
    [effectiveFirstAttendedAt, firstAttendedAt]
  );
  const maxMonth = useMemo(
    () => startOfMonth(selectedAttendedUntil ?? lastAvailableMonth ?? new Date()),
    [lastAvailableMonth, selectedAttendedUntil]
  );
  /** 실제 첫 등원일이 있는 달만 이전 이동 차단 (퍼블리싱 폴백 날짜는 하한에 쓰지 않음) */
  const isFirstAttendanceMonth =
    firstAttendanceDate != null && !isFirstAttendanceDateFallback;
  const canGoPrevMonth =
    selectedMonth.getTime() > minMonth.getTime() && !isFirstAttendanceMonth;
  const canGoNextMonth = selectedMonth.getTime() < maxMonth.getTime();

  const title = selectedKindergarten?.name ?? linkedKindergarten?.name ?? '';

  const hasRows =
    items.length > 0 || firstAttendanceDate != null || attendedUntilDate != null;
  /** 펫/상세 조회 끝나기 전 empty 일러스트가 스치지 않게 */
  const isListLoading = isPending;

  const handleBack = () => {
    navigateToTab('/compare');
  };

  const handleKindergartenSelect = useCallback(
    (kindergartenId: string) => {
      const next = kindergartens.find((item) => item.id === kindergartenId) ?? null;
      setSelectedKindergartenId(kindergartenId);
      setIsScrollTopVisible(false);
      if (next?.attendedUntil != null) {
        setRequestedMonth(startOfMonth(parseDateKey(next.attendedUntil)));
        return;
      }
      setRequestedMonth(startOfMonth(new Date()));
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
    setRequestedMonth((prev) => startOfMonth(addMonths(prev, -1)));
    setIsScrollTopVisible(false);
  };

  const handleNextMonth = () => {
    if (!canGoNextMonth) {
      toast({ title: content.monthNav.maxMonthToast });
      return;
    }
    setRequestedMonth((prev) => startOfMonth(addMonths(prev, 1)));
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
          setRequestedMonth(startOfMonth(month));
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
          {isListLoading && !hasRows ? (
            <div className='flex min-h-0 flex-1 items-center justify-center'>
              <RingLoadingSpinner />
            </div>
          ) : hasRows ? (
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
