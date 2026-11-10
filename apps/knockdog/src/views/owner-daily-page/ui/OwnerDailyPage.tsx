'use client';

import { useCallback, useLayoutEffect, useRef, useState, type UIEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { Float, FloatingActionButton, Tabs, TabsContent, TabsList, TabsTrigger } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { OWNER_DAILY_TAB_LABEL, type OwnerDailyTab } from '@views/owner-daily-page/config/ownerDailyContent';
import { formatOwnerDailyDateLabel } from '@views/owner-daily-page/lib/ownerDailyDateLabel';
import { toOwnerDailySummaryView } from '@views/owner-daily-page/lib/ownerDailySummary';
import { useOwnerDailyActions } from '@views/owner-daily-page/model/useOwnerDailyActions';
import { useOwnerDailyPage } from '@views/owner-daily-page/model/useOwnerDailyPage';
import { OwnerDailyAttendanceCheckTab } from '@views/owner-daily-page/ui/OwnerDailyAttendanceCheckTab';
import { OwnerDailyAttendanceListTab } from '@views/owner-daily-page/ui/OwnerDailyAttendanceListTab';
import { OwnerDailyDatePickerSheet } from '@views/owner-daily-page/ui/OwnerDailyDatePickerSheet';
import { OwnerDailySummarySection } from '@views/owner-daily-page/ui/OwnerDailySummarySection';
import { Header } from '@widgets/Header';

import { useHasUnreadNotificationQuery } from '@entities/notification';
import { useUserStore } from '@entities/user';

import { REQUEST_FAILED_MESSAGE } from '@shared/api';
import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { NotificationBell } from '@shared/ui/notification-bell';
import { toast } from '@shared/ui/toast';

const OwnerDailyReturnHomeBack = ({ onBack }: { onBack: () => void }) => {
  useNativeBackHandler(onBack);
  return null;
};

const TAB_CONTENT_CLASS_NAME = 'bg-bg-50 min-h-0 flex-1 overflow-y-auto pb-[calc(var(--bottom-bar-height)+88px)]';

/** 원장 일과 화면. 날짜 이동·등원 현황·`등원처리`/`등원목록` 탭을 조합한다. */
const OwnerDailyPage = () => {
  const { back, push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const { data: hasUnreadNotification = false } = useHasUnreadNotificationQuery({
    userId,
    audience: 'OWNER',
    enabled: true,
  });
  const fromHome = useSearchParams().get('from') === 'home';
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
    todayList,
    isLoading,
    isError,
    keyword,
    lateOnly,
    todayFilter,
    setKeyword,
    setLateOnly,
    setTodayFilter,
    handleDateSelect,
    handlePrevDayClick,
    handleNextDayClick,
    handleTodayClick,
    handleTabChange,
  } = useOwnerDailyPage();
  const { pendingPetIds, handleCheckIn, handleAbsent } = useOwnerDailyActions({ userId, dateKey: selectedDateKey });
  // 스크롤한 화면(날짜+탭)을 기억해 두고, 날짜나 탭이 바뀌면 자동으로 버튼이 사라지게 한다.
  const [scrolledViewKey, setScrolledViewKey] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isToday = dayKind === 'today';
  const viewKey = `${selectedDateKey}:${selectedTab}`;
  const isScrollTopButtonVisible = scrolledViewKey === viewKey;
  const summaryView = summary && !isLoading && !isError ? toOwnerDailySummaryView(summary, dayKind) : null;

  const handleBackToOwnerHome = useCallback(() => {
    if (isNativeWebView()) {
      navigateToTab('/owner').catch(() => {
        push({ pathname: '/owner' });
      });
      return;
    }

    back();
  }, [back, navigateToTab, push]);

  /** 원생 카드를 누르면 그 원생의 프로필로 이동한다. */
  const handleMemberClick = ({ petId }: { petId: string }) => {
    push({ pathname: route.owner.members.detail.root.replace('[id]', petId) }).catch(() => {
      toast({ type: 'default', shape: 'rounded', title: REQUEST_FAILED_MESSAGE, nativeTitle: REQUEST_FAILED_MESSAGE });
    });
  };

  const handleDatePickerOpen = () => {
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

  return (
    <div data-testid='owner-daily-root' className='bg-bg-50 relative flex h-dvh flex-col'>
      <div className='bg-bg-0 pt-(--safe-area-inset-top,0px)'>
        {fromHome ? <OwnerDailyReturnHomeBack onBack={handleBackToOwnerHome} /> : null}
        <Header>
          {fromHome ? (
            <Header.LeftSection>
              <Header.BackButton aria-label='이전' onClick={handleBackToOwnerHome} />
            </Header.LeftSection>
          ) : null}
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
        <OwnerDailySummarySection
          summaryView={summaryView}
          dateNav={{
            label: formatOwnerDailyDateLabel(selectedDate, today),
            onPrevDay: handlePrevDayClick,
            onNextDay: handleNextDayClick,
            onOpenDatePicker: handleDatePickerOpen,
            onGoToday: handleTodayClick,
            isPrevDayDisabled,
            isNextDayDisabled,
            isToday,
          }}
        />
        {isLoading ? (
          <DelayedLoadingSpinner isLoading={isLoading} layout='content' className='bg-bg-50' />
        ) : isError ? (
          // 임시 오류 문구. 정식 오류 화면(PageError)은 이어지는 작업에서 붙인다.
          <div className='bg-bg-50 flex min-h-0 flex-1 items-center justify-center px-4 pb-[calc(var(--bottom-bar-height)+30px)]'>
            <div className='flex flex-col items-center gap-1 text-center'>
              <p className='h2-extrabold text-text-primary'>일과 정보를 불러오지 못했어요</p>
              <p className='body1-regular text-text-secondary'>잠시 후 다시 시도해 주세요.</p>
            </div>
          </div>
        ) : (
          <Tabs
            value={selectedTab}
            className='flex min-h-0 flex-1 flex-col'
            onValueChange={(value) => handleTabChange(value as OwnerDailyTab)}
          >
            <TabsList>
              <TabsTrigger value='attendance-check' data-testid='owner-daily-tab-attendance-check'>
                {OWNER_DAILY_TAB_LABEL['attendance-check']}
              </TabsTrigger>
              <TabsTrigger value='attendance-list' data-testid='owner-daily-tab-today-attendance'>
                {OWNER_DAILY_TAB_LABEL['attendance-list']}
              </TabsTrigger>
            </TabsList>
            <TabsContent
              ref={contentRef}
              value='attendance-check'
              className={TAB_CONTENT_CLASS_NAME}
              onScroll={handleContentScroll}
            >
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
                  onCheckIn={handleCheckIn}
                  onAbsent={handleAbsent}
                />
              ) : null}
            </TabsContent>
            <TabsContent
              ref={contentRef}
              value='attendance-list'
              className={TAB_CONTENT_CLASS_NAME}
              onScroll={handleContentScroll}
            >
              {todayList ? (
                <OwnerDailyAttendanceListTab
                  todayList={todayList}
                  filter={todayFilter}
                  onFilterChange={setTodayFilter}
                  onMemberClick={handleMemberClick}
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
