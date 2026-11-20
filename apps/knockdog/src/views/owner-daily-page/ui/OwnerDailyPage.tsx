'use client';

import { useLayoutEffect, useRef, useState, type UIEvent } from 'react';
import { Float, FloatingActionButton, Tabs, TabsContent, TabsList, TabsTrigger } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { OWNER_DAILY_TAB_LABEL, type OwnerDailyTab } from '@views/owner-daily-page/config/ownerDailyContent';
import { formatOwnerDailyDateLabel } from '@views/owner-daily-page/lib/ownerDailyDateLabel';
import { scrollToFirstFocusCard } from '@views/owner-daily-page/lib/ownerDailyFocus';
import { toOwnerDailySummaryView } from '@views/owner-daily-page/lib/ownerDailySummary';
import { useOwnerDailyActions } from '@views/owner-daily-page/model/useOwnerDailyActions';
import { useOwnerDailyCancelDialog } from '@views/owner-daily-page/model/useOwnerDailyCancelDialog';
import { useOwnerDailyPage } from '@views/owner-daily-page/model/useOwnerDailyPage';
import { OwnerDailyAttendanceCheckTab } from '@views/owner-daily-page/ui/OwnerDailyAttendanceCheckTab';
import { OwnerDailyAttendanceListTab } from '@views/owner-daily-page/ui/OwnerDailyAttendanceListTab';
import {
  OwnerDailyFutureNoticeState,
  OwnerDailyNoReservationState,
  OwnerDailyNotConfiguredState,
  OwnerDailyPastCheckNoticeState,
  OwnerDailyPastNoRecordState,
} from '@views/owner-daily-page/ui/OwnerDailyEmptyStates';
import { OwnerDailyFutureListTab } from '@views/owner-daily-page/ui/OwnerDailyFutureListTab';
import { OwnerDailyPastListTab } from '@views/owner-daily-page/ui/OwnerDailyPastListTab';
import { OwnerDailyDateNav } from '@views/owner-daily-page/ui/OwnerDailyDateNav';
import { OwnerDailyDatePickerSheet } from '@views/owner-daily-page/ui/OwnerDailyDatePickerSheet';
import { OwnerDailySummarySection } from '@views/owner-daily-page/ui/OwnerDailySummarySection';
import {
  PROFILE_TAB_QUERY_KEY,
  TAB as PROFILE_TAB,
} from '@views/owner/member-profile/config/ownerMemberProfileContent';
import { Header } from '@widgets/Header';

import { useHasUnreadNotificationQuery } from '@entities/notification';
import { useUserStore } from '@entities/user';

import { REQUEST_FAILED_MESSAGE } from '@shared/api';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { NotificationBell } from '@shared/ui/notification-bell';
import { PageError } from '@shared/ui/page-error';
import { toast } from '@shared/ui/toast';

const TAB_TRIGGER_CLASS_NAME =
  'text-size-body1 h-x12 px-x4 py-x3 data-[state=inactive]:text-text-secondary border-b-0 leading-6 font-bold';

// 날짜 선택줄 아래 전체(등원 현황·탭·목록)가 하나의 스크롤 영역이다.
const SCROLL_AREA_CLASS_NAME = 'bg-bg-50 flex min-h-0 flex-1 flex-col overflow-y-auto';
const TAB_CONTENT_CLASS_NAME = 'bg-bg-50 flex-1 pb-[calc(var(--bottom-bar-height)+88px)]';
// 오늘 탭은 안내를 하단 내비게이션 위쪽 영역의 가운데에 두기 위해 아래 여백을 목록 쪽에서 둔다.
const CHECK_TAB_CONTENT_CLASS_NAME = 'bg-bg-50 flex-1 pb-(--bottom-bar-height)';

/** 원장 일과 화면. 날짜 이동·등원 현황·`등원처리`/`등원목록` 탭을 조합한다. */
const OwnerDailyPage = () => {
  const { push } = useStackNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const { data: hasUnreadNotification = false } = useHasUnreadNotificationQuery({
    userId,
    audience: 'OWNER',
    enabled: true,
  });
  const {
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
    summary,
    candidates,
    isNoReservation,
    isNotConfigured,
    todayList,
    isLoading,
    isError,
    keyword,
    lateOnly,
    todayFilter,
    focusStatus,
    setKeyword,
    setLateOnly,
    setTodayFilter,
    handleRetry,
    handleDateSelect,
    handlePrevDayClick,
    handleNextDayClick,
    handleTodayClick,
    handleTabChange,
    clearFocusStatus,
  } = useOwnerDailyPage();
  const {
    pendingPetIds,
    handleCheckIn,
    handleAbsent,
    handleCheckOut,
    handleCancelCheckIn,
    handleCancelAbsent,
    handleCancelCheckOut,
  } = useOwnerDailyActions({ userId, dateKey: selectedDateKey });
  const { openCancelDialog } = useOwnerDailyCancelDialog({
    onCancelCheckIn: handleCancelCheckIn,
    onCancelAbsent: handleCancelAbsent,
    onCancelCheckOut: handleCancelCheckOut,
  });
  // 스크롤한 화면(날짜+탭)을 기억해 두고, 날짜나 탭이 바뀌면 자동으로 버튼이 사라지게 한다.
  const [scrolledViewKey, setScrolledViewKey] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isToday = dayKind === 'today';
  const viewKey = `${selectedDateKey}:${selectedTab}`;
  const isScrollTopButtonVisible = scrolledViewKey === viewKey;
  // 지난 날짜에 등원·결석 기록이 하나도 없으면 날짜 줄과 안내만 보여 준다.
  const isPast = dayKind === 'past';
  const isPastNoRecord = isPast && todayList?.counts.all === 0;
  const isFuture = dayKind === 'future';
  const summaryView =
    summary && !isNotConfigured && !isLoading && !isError && !isPastNoRecord && !isNoReservation
      ? toOwnerDailySummaryView(summary, dayKind)
      : null;

  const pushOrToastFailure = (pathname: string, query?: Record<string, string>) => {
    push(query ? { pathname, query } : { pathname }).catch(() => {
      toast({ type: 'default', shape: 'rounded', title: REQUEST_FAILED_MESSAGE, nativeTitle: REQUEST_FAILED_MESSAGE });
    });
  };

  /** 원생 카드를 누르면 그 원생의 프로필로 이동한다. */
  const handleMemberClick = ({ petId }: { petId: string }) => {
    pushOrToastFailure(route.owner.members.detail.root.replace('[id]', petId));
  };

  /** 지난 날짜 카드를 누르면 그 원생의 프로필을 `등하원 기록` 탭으로 연다. */
  const handlePastMemberClick = ({ petId }: { petId: string }) => {
    pushOrToastFailure(route.owner.members.detail.root.replace('[id]', petId), {
      [PROFILE_TAB_QUERY_KEY]: PROFILE_TAB.ATTENDANCE,
    });
  };

  /**
   * `알림장 작성하기`·`알림장 보기`는 같은 원생별 알림장 화면으로 이동한다.
   * 이 화면은 오늘 알림장이 발송됐으면 읽기 전용(발송된 알림장 상세)으로 열린다.
   */
  const handleNoticeClick = ({ petId }: { petId: string }) => {
    pushOrToastFailure(route.owner.daily.notice.write.root.replace('[id]', petId));
  };

  /** `설정하기`를 누르면 예약 설정 화면으로 이동한다. */
  const handleSetUpClick = () => {
    pushOrToastFailure(route.mypage.kindergarten.reservation.root);
  };

  const handleDatePickerOpen = () => {
    if (isNotConfigured) return;

    overlay.open(({ isOpen, close }) => (
      <OwnerDailyDatePickerSheet
        isOpen={isOpen}
        close={close}
        minDate={minDate}
        maxDate={maxDate}
        initialDate={selectedDate}
        onConfirm={handleDateSelect}
      />
    ));
  };

  const handleContentScroll = (event: UIEvent<HTMLDivElement>) => {
    setScrolledViewKey(event.currentTarget.scrollTop > 0 ? viewKey : null);
  };

  const handleScrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 날짜나 탭이 바뀌면 맨 위에서 시작한다.
  useLayoutEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [viewKey]);

  // 홈 등원 현황 카드로 열렸으면 목록이 그려진 뒤 누른 상태의 첫 원생 카드로 스크롤한다. 한 번만 하고 주소에서 지운다.
  const isListVisible = !isNotConfigured && !isLoading && !isError && !isPastNoRecord && !isNoReservation;
  useLayoutEffect(() => {
    if (!focusStatus || !isListVisible) return;

    if (contentRef.current) scrollToFirstFocusCard(contentRef.current, focusStatus);
    clearFocusStatus();
  }, [focusStatus, isListVisible, clearFocusStatus]);

  return (
    <div data-testid='owner-daily-root' className='bg-bg-50 relative flex h-dvh flex-col'>
      <div className='bg-bg-0 pt-(--safe-area-inset-top,0px)'>
        <Header>
          <Header.Title>일과</Header.Title>
          <Header.RightSection>
            <NotificationBell
              hasUnread={hasUnreadNotification}
              onClick={() => push({ pathname: route.notification.root })}
            />
          </Header.RightSection>
        </Header>
      </div>
      <main className='bg-bg-0 flex min-h-0 flex-1 flex-col'>
        {/* 날짜 선택줄은 스크롤과 관계없이 항상 보인다. */}
        <div className='bg-bg-0 px-x6 py-x5 flex w-full'>
          <OwnerDailyDateNav
            label={formatOwnerDailyDateLabel(selectedDate, today)}
            onPrevDay={handlePrevDayClick}
            onNextDay={handleNextDayClick}
            onOpenDatePicker={handleDatePickerOpen}
            onGoToday={handleTodayClick}
            isPrevDayDisabled={isPrevDayDisabled}
            isNextDayDisabled={isNextDayDisabled}
            isToday={isToday}
          />
        </div>
        {isNotConfigured ? (
          <OwnerDailyNotConfiguredState onSetUpClick={handleSetUpClick} />
        ) : isLoading ? (
          <DelayedLoadingSpinner isLoading={isLoading} layout='content' className='bg-bg-50' />
        ) : isError ? (
          <PageError layout='inline' onRetry={handleRetry} />
        ) : isPastNoRecord ? (
          <OwnerDailyPastNoRecordState />
        ) : isNoReservation ? (
          <OwnerDailyNoReservationState isFuture={isFuture} />
        ) : (
          // 등원 현황·탭·목록이 이 `Tabs` 하나에서 같이 스크롤되고, 탭만 위쪽에 붙는다.
          <Tabs
            ref={contentRef}
            value={selectedTab}
            className={SCROLL_AREA_CLASS_NAME}
            onScroll={handleContentScroll}
            onValueChange={(value) => handleTabChange(value as OwnerDailyTab)}
          >
            <OwnerDailySummarySection summaryView={summaryView} />
            <TabsList className='bg-bg-0 h-x12 sticky top-0 z-10 shrink-0 border-b-0 shadow-[inset_0_-1px_0_0_var(--color-line-200)]'>
              <TabsTrigger
                value='attendance-check'
                data-testid='owner-daily-tab-attendance-check'
                className={TAB_TRIGGER_CLASS_NAME}
              >
                {OWNER_DAILY_TAB_LABEL['attendance-check']}
              </TabsTrigger>
              <TabsTrigger
                value='attendance-list'
                data-testid='owner-daily-tab-today-attendance'
                className={TAB_TRIGGER_CLASS_NAME}
              >
                {OWNER_DAILY_TAB_LABEL['attendance-list']}
              </TabsTrigger>
            </TabsList>
            <TabsContent value='attendance-check' className={CHECK_TAB_CONTENT_CLASS_NAME}>
              {isToday && candidates ? (
                <OwnerDailyAttendanceCheckTab
                  items={candidates}
                  dateKey={selectedDateKey}
                  now={now}
                  keyword={keyword}
                  lateOnly={lateOnly}
                  onKeywordChange={setKeyword}
                  onLateOnlyChange={setLateOnly}
                  pendingPetIds={pendingPetIds}
                  onMemberClick={handleMemberClick}
                  onCheckIn={handleCheckIn}
                  onAbsent={handleAbsent}
                  onCancelCheckIn={(item) => openCancelDialog('checkIn', item)}
                  onCancelAbsent={(item) => openCancelDialog('absent', item)}
                />
              ) : null}
              {!isToday ? (
                <div className='flex min-h-full w-full flex-col'>
                  {isPast ? <OwnerDailyPastCheckNoticeState /> : <OwnerDailyFutureNoticeState />}
                </div>
              ) : null}
            </TabsContent>
            <TabsContent
              value='attendance-list'
              className={isToday ? CHECK_TAB_CONTENT_CLASS_NAME : TAB_CONTENT_CLASS_NAME}
            >
              {todayList && isPast ? (
                <OwnerDailyPastListTab
                  todayList={todayList}
                  filter={todayFilter}
                  onFilterChange={setTodayFilter}
                  onMemberClick={handlePastMemberClick}
                />
              ) : null}
              {isFuture && candidates ? <OwnerDailyFutureListTab items={candidates} dateKey={selectedDateKey} /> : null}
              {todayList && !isPast ? (
                <OwnerDailyAttendanceListTab
                  todayList={todayList}
                  filter={todayFilter}
                  onFilterChange={setTodayFilter}
                  pendingPetIds={pendingPetIds}
                  onMemberClick={handleMemberClick}
                  onWriteRecord={handleNoticeClick}
                  onViewRecord={handleNoticeClick}
                  onCheckOut={handleCheckOut}
                  onCancelCheckOut={(item) => openCancelDialog('checkOut', item)}
                />
              ) : null}
            </TabsContent>
          </Tabs>
        )}
      </main>
      {isScrollTopButtonVisible ? (
        <Float placement='bottom-end' offsetX='x4' offsetY='calc(var(--bottom-bar-height) + 20px)' zIndex={50}>
          <FloatingActionButton
            className='text-black'
            icon='ChevronTop'
            label='맨 위로'
            variant='neutralLight'
            size='medium'
            extended={false}
            onClick={handleScrollToTop}
          />
        </Float>
      ) : null}
    </div>
  );
};

export { OwnerDailyPage };
