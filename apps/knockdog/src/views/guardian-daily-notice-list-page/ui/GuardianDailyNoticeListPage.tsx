'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { useGuardianSchoolConnectionSchoolsQuery } from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { GuardianAlbumMonthPickerSheet } from '@views/guardian-album-page/ui/GuardianAlbumMonthPickerSheet';
import { GuardianAlbumScrollTopButton } from '@views/guardian-album-page/ui/GuardianAlbumScrollTopButton';
import { guardianDailyNoticeListContent } from '@views/guardian-daily-notice-list-page/config/guardianDailyNoticeListContent';
import { isDisconnectedListMock } from '@views/guardian-daily-notice-list-page/config/guardianDailyNoticeListMock';
import { useGuardianDailyNoticeMonthList } from '@views/guardian-daily-notice-list-page/model/useGuardianDailyNoticeMonthList';
import { GuardianDailyNoticeListMonthEmpty } from '@views/guardian-daily-notice-list-page/ui/GuardianDailyNoticeListMonthEmpty';
import { GuardianDailyNoticeListMonthList } from '@views/guardian-daily-notice-list-page/ui/GuardianDailyNoticeListMonthList';
import { GuardianDailyNoticeListMonthNav } from '@views/guardian-daily-notice-list-page/ui/GuardianDailyNoticeListMonthNav';
import { SafeArea } from '@shared/ui/safe-area';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';
import { useGuardianKindergartenHome } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenHome';
import {
  toKindergartenSelectOptions,
  toKindergartenSelectOptionsFromConnections,
  toMonthEndDateKey,
} from '@views/guardian-kindergarten-page/model/toKindergartenSelectOptions';
import { pushGuardianDailyNoticeDetail } from '@views/guardian-kindergarten-page/lib/pushGuardianDailyNoticeDetail';
import { Header } from '@widgets/Header';
import { route } from '@shared/constants/route';
import { useStackNavigation, useTabNavigation, useNativeBackHandler } from '@shared/lib/bridge';
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

function parseSchoolIdQuery(value: string | null) {
  return value?.trim() ? value : null;
}

function GuardianDailyNoticeListPage() {
  const content = guardianDailyNoticeListContent;
  const searchParams = useSearchParams();
  const { navigateToTab } = useTabNavigation();
  const { push, back } = useStackNavigation();
  const { selectedPetId, isPetsReady } = useGuardianSelectedPet();
  const { firstAttendedAt, linkedKindergarten, status } = useGuardianKindergartenHome();
  const userId = useUserStore((state) => state.user?.userId);
  const { data: connections, isPending: isMembershipPending } = useGuardianSchoolConnectionSchoolsQuery({
    userId,
    petId: selectedPetId,
    enabled: Boolean(userId) && Boolean(selectedPetId),
  });
  const isMockMode = isDisconnectedListMock(searchParams.get('mock'));
  const schoolIdFromQuery = parseSchoolIdQuery(searchParams.get('schoolId'));
  const noticeReturnDate = searchParams.get('date')?.trim() || null;
  const isFromNoticeDetail = searchParams.get('from') === 'notice' && Boolean(noticeReturnDate);

  const isDisconnected = status === 'disconnected' || isMockMode;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedKindergartenId, setSelectedKindergartenId] = useState<string | null>(null);
  const [requestedMonth, setRequestedMonth] = useState(
    () => parseMonthQuery(searchParams.get('month')) ?? startOfMonth(new Date())
  );
  const [isScrollTopVisible, setIsScrollTopVisible] = useState(false);

  const disconnectedUntilKey = isDisconnected ? toMonthEndDateKey(new Date()) : null;

  /** 학교 단위 목록. 없으면 home 현재 연결 1건 */
  const kindergartens = useMemo(() => {
    const fromConnections = toKindergartenSelectOptionsFromConnections(connections ?? []);
    if (fromConnections.length > 0) return fromConnections;
    return toKindergartenSelectOptions(linkedKindergarten, disconnectedUntilKey);
  }, [connections, disconnectedUntilKey, linkedKindergarten]);
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
  const selectedAttendedUntilKey = selectedKindergarten?.attendedUntil ?? null;
  const selectedAttendedFromKey = selectedKindergarten?.attendedFrom ?? null;
  const selectedAttendedUntil = useMemo(
    () => (selectedAttendedUntilKey ? parseDateKey(selectedAttendedUntilKey) : null),
    [selectedAttendedUntilKey]
  );
  const selectedAttendedFrom = useMemo(
    () => (selectedAttendedFromKey ? parseDateKey(selectedAttendedFromKey) : null),
    [selectedAttendedFromKey]
  );
  const selectedSchoolId = selectedKindergarten?.schoolId ?? selectedKindergarten?.id ?? null;
  const isSelectedDisconnected = selectedAttendedUntil != null || isDisconnected;

  const {
    timeline,
    effectiveFirstAttendedAt,
    lastAvailableMonth,
    isPending,
  } = useGuardianDailyNoticeMonthList({
    schoolId: selectedSchoolId,
    petId: selectedPetId,
    selectedMonth: requestedMonth,
    firstAttendedAt,
    attendedFrom: selectedAttendedFrom,
    attendedUntil: selectedAttendedUntil,
    isDisconnected: isSelectedDisconnected,
    isPetsReady,
    isMembershipPending,
  });

  const selectedMonth = useMemo(() => {
    if (!isSelectedDisconnected || !lastAvailableMonth) return requestedMonth;
    const cap = startOfMonth(lastAvailableMonth);
    return requestedMonth.getTime() > cap.getTime() ? cap : requestedMonth;
  }, [isSelectedDisconnected, lastAvailableMonth, requestedMonth]);

  const minMonth = useMemo(
    () =>
      startOfMonth(
        // records firstAvailableMonth(전체 이력) > schools 최신 connectedAt
        effectiveFirstAttendedAt ?? selectedAttendedFrom ?? firstAttendedAt ?? new Date(2020, 0, 1)
      ),
    [effectiveFirstAttendedAt, firstAttendedAt, selectedAttendedFrom]
  );
  const maxMonth = useMemo(
    () =>
      startOfMonth(
        // 다니는 중이면 lastAvailableMonth=null → 이번 달까지
        lastAvailableMonth ?? selectedAttendedUntil ?? new Date()
      ),
    [lastAvailableMonth, selectedAttendedUntil]
  );
  /** 최초 연결월(하한)에 있을 때만 이전 달 이동 차단 — 재연결 월 배너와 무관 */
  const canGoPrevMonth = selectedMonth.getTime() > minMonth.getTime();
  const canGoNextMonth = selectedMonth.getTime() < maxMonth.getTime();

  const title = selectedKindergarten?.name ?? linkedKindergarten?.name ?? '';

  const hasRows = timeline.length > 0;
  /** 펫/상세 조회 끝나기 전 empty 일러스트가 스치지 않게 */
  const isListLoading = isPending;

  const handleBack = useCallback(() => {
    if (isFromNoticeDetail && noticeReturnDate) {
      void (async () => {
        const wentBack = await back();
        if (wentBack) return;
        // reset 등으로 스택이 없으면 같은 날짜 상세로 재진입
        push({
          pathname: route.compare.notice.root,
          query: {
            date: noticeReturnDate,
            ...(schoolIdFromQuery ? { schoolId: schoolIdFromQuery } : {}),
          },
        });
      })();
      return;
    }
    void navigateToTab('/compare');
  }, [back, isFromNoticeDetail, navigateToTab, noticeReturnDate, push, schoolIdFromQuery]);

  useNativeBackHandler(handleBack);

  // 강아지 전환으로 연결 유치원이 없어지면 빈 리스트에 머물지 않고 유치원 홈으로
  useEffect(() => {
    if (!isPetsReady || isMembershipPending || isMockMode) return;
    if (kindergartens.length > 0) return;
    void navigateToTab('/compare');
  }, [isMembershipPending, isMockMode, isPetsReady, kindergartens.length, navigateToTab]);

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
    <SafeArea className='bg-bg-50 relative flex h-dvh flex-col' edges={['top', 'bottom']}>
      <div
        aria-hidden
        className='bg-bg-0 pointer-events-none absolute inset-x-0 top-0'
        style={{ height: 'max(var(--safe-area-inset-top, 0px), env(safe-area-inset-top, 0px))' }}
      />
      <div className='sticky top-0 z-10 shrink-0'>
        <div className='bg-bg-0'>
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
          className='bg-bg-50 web:pb-(--bottom-bar-height) flex h-full flex-col overflow-y-auto'
          onScroll={handleScroll}
          aria-label={content.listAriaLabel}
        >
          {isListLoading && !hasRows ? (
            <div className='flex min-h-0 flex-1 items-center justify-center'>
              <RingLoadingSpinner />
            </div>
          ) : hasRows ? (
            <GuardianDailyNoticeListMonthList
              timeline={timeline}
              onItemClick={(item) => {
                if (!selectedSchoolId) return;
                pushGuardianDailyNoticeDetail(push, item.date, { schoolId: selectedSchoolId });
              }}
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
    </SafeArea>
  );
}

export { GuardianDailyNoticeListPage };
