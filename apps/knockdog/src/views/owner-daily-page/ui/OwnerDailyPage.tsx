'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Float, FloatingActionButton, Tabs, TabsContent, TabsList, TabsTrigger } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { STORAGE_KEYS } from '@shared/constants/storage';
import { openConfirmDialog } from '@shared/lib/bridge';
import { buildHref, searchParamsToQuery } from '@shared/lib/bridge/queryUtils';
import { safeSessionStorage } from '@shared/lib/storage';
import { ellipsisText } from '@shared/utils';
import type { AttendanceMember } from '@views/owner-daily-page/config/ownerDailyContent';
import { OwnerDailyCancelCheckOutDialog } from '@views/owner-daily-page/ui/OwnerDailyCancelCheckOutDialog';
import { OwnerDailyCancelCheckInDialog } from '@views/owner-daily-page/ui/OwnerDailyCancelCheckInDialog';
import { useOwnerDailyPage } from '@views/owner-daily-page/model/useOwnerDailyPage';
import { OwnerDailySummarySection } from '@views/owner-daily-page/ui/OwnerDailySummarySection';
import { OwnerDailyTabContent } from '@views/owner-daily-page/ui/OwnerDailyTabContent';
import {
  TodayAttendanceTab,
  type TodayAttendanceFilter,
} from '@views/owner-daily-page/ui/TodayAttendanceTab';
import { Header } from '@widgets/Header';

type OwnerDailyTab = 'attendance-check' | 'today-attendance';

function resolveOwnerDailyTab(value: string | null): OwnerDailyTab {
  return value === 'today-attendance' ? 'today-attendance' : 'attendance-check';
}

function readPersistedOwnerDailyTab(): OwnerDailyTab | null {
  const value = safeSessionStorage.get(STORAGE_KEYS.OWNER_DAILY_TAB);
  if (value === 'today-attendance' || value === 'attendance-check') return value;
  return null;
}

function persistOwnerDailyTab(tab: OwnerDailyTab) {
  safeSessionStorage.set(STORAGE_KEYS.OWNER_DAILY_TAB, tab);
}

function resolveInitialOwnerDailyTab(rawTab: string | null): OwnerDailyTab {
  if (rawTab === 'today-attendance' || rawTab === 'attendance-check') {
    return resolveOwnerDailyTab(rawTab);
  }
  return readPersistedOwnerDailyTab() ?? 'attendance-check';
}

function resolveTodayAttendanceFilter(value: string | null): TodayAttendanceFilter {
  if (value === 'checked-in' || value === 'noticebook-pending') return value;

  return 'all';
}

function OwnerDailyPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const rawTodayFilter = searchParams.get('todayFilter');
  const initialTodayAttendanceFilter = resolveTodayAttendanceFilter(rawTodayFilter);
  const [selectedTab, setSelectedTab] = useState<OwnerDailyTab>(() => resolveInitialOwnerDailyTab(rawTab));
  const [isScrollTopButtonVisible, setIsScrollTopButtonVisible] = useState(false);
  const attendanceCheckContentRef = useRef<HTMLDivElement>(null);
  const todayAttendanceContentRef = useRef<HTMLDivElement>(null);
  const {
    attendanceCheckMembers,
    canOpenCancelCheckInDialog,
    cancelCheckOut,
    cancelCheckIn,
    dateLabel,
    handleCheckFilterClick,
    handleCheckIn,
    handleCheckOut,
    handleClearSearchKeyword,
    handleInviteGuardianClick,
    handleMemberClick,
    handleNoticebookButtonClick,
    handleSearchKeywordChange,
    hasConnectedMembers,
    isError,
    isLoading,
    isTodayError,
    isTodayLoading,
    normalizedSearchKeyword,
    searchKeyword,
    showUncheckedOnly,
    summaryItems,
    todayAttendanceMembers,
  } = useOwnerDailyPage();

  const handleCancelCheckIn = async (member: AttendanceMember) => {
    if (!canOpenCancelCheckInDialog(member)) return;

    const result = await openConfirmDialog({
      title: `${ellipsisText(member.name, 8)}의 등원을 취소할까요?`,
      titleParts: [{ text: ellipsisText(member.name, 8), accent: true }, { text: '의 등원을 취소할까요?' }],
      description: '취소하면 등원 전 상태로 돌아가요.',
      cancelLabel: '닫기',
      confirmLabel: '등원 취소',
      contentPaddingHorizontal: 16,
      showAvatar: true,
      avatarUrl: member.profileImageUrl,
    });

    if (result.status === 'pending') return;

    if (result.status === 'resolved') {
      if (result.action === 'confirm') void cancelCheckIn(member, () => {});
      return;
    }

    overlay.open(({ isOpen, close }) => (
      <OwnerDailyCancelCheckInDialog
        member={member}
        open={isOpen}
        onOpenChange={close}
        onCancel={() => cancelCheckIn(member, close)}
      />
    ));
  };

  const handleAttendanceButtonClick = (member: AttendanceMember) => {
    if (member.checkedIn) {
      handleCancelCheckIn(member);
      return;
    }

    handleCheckIn(member);
  };

  const handleCancelCheckOut = async (member: AttendanceMember) => {
    const result = await openConfirmDialog({
      title: `${ellipsisText(member.name, 8)}의 하원을 취소할까요?`,
      titleParts: [{ text: ellipsisText(member.name, 8), accent: true }, { text: '의 하원을 취소할까요?' }],
      description: '취소하면 재원 중 상태로 돌아가요.',
      cancelLabel: '닫기',
      confirmLabel: '하원 취소',
      contentPaddingHorizontal: 16,
      showAvatar: true,
      avatarUrl: member.profileImageUrl,
    });

    if (result.status === 'pending') return;

    if (result.status === 'resolved') {
      if (result.action === 'confirm') void cancelCheckOut(member, () => {});
      return;
    }

    overlay.open(({ isOpen, close }) => (
      <OwnerDailyCancelCheckOutDialog
        member={member}
        open={isOpen}
        onOpenChange={close}
        onCancel={() => cancelCheckOut(member, close)}
      />
    ));
  };

  const handleCheckOutButtonClick = (member: AttendanceMember) => {
    if (member.checkedOut) {
      handleCancelCheckOut(member);
      return;
    }

    handleCheckOut(member);
  };

  const handleTabValueChange = (value: string) => {
    const nextTab = value as OwnerDailyTab;
    setSelectedTab(nextTab);
    persistOwnerDailyTab(nextTab);

    const query = searchParamsToQuery(searchParams);
    if (nextTab === 'today-attendance') {
      query.tab = 'today-attendance';
    } else {
      delete query.tab;
      delete query.todayFilter;
    }
    router.replace(buildHref(pathname, query), { scroll: false });
  };

  const handleContentScroll = (scrollTop: number) => {
    setIsScrollTopButtonVisible(scrollTop > 0);
  };

  const handleScrollToTop = () => {
    const contentRef = selectedTab === 'today-attendance' ? todayAttendanceContentRef : attendanceCheckContentRef;
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // URL에 tab이 있을 때만 동기화. remount 시 bare /owner/daily면 localStorage 유지.
    if (rawTab !== 'today-attendance' && rawTab !== 'attendance-check') return;

    const nextTab = resolveOwnerDailyTab(rawTab);
    setSelectedTab(nextTab);
    persistOwnerDailyTab(nextTab);
  }, [rawTab]);

  // remount 후 URL에 tab이 없으면 저장된 탭을 쿼리에 반영 (뒤로가기 등)
  useEffect(() => {
    if (rawTab === 'today-attendance' || rawTab === 'attendance-check') return;
    if (selectedTab !== 'today-attendance') return;

    const query = searchParamsToQuery(searchParams);
    query.tab = 'today-attendance';
    router.replace(buildHref(pathname, query), { scroll: false });
    // mount 시 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    setIsScrollTopButtonVisible(false);
    const animationFrameId = requestAnimationFrame(() => {
      const contentRef = selectedTab === 'today-attendance' ? todayAttendanceContentRef : attendanceCheckContentRef;
      contentRef.current?.scrollTo({ top: 0 });
    });

    return () => cancelAnimationFrame(animationFrameId);
  }, [selectedTab]);

  return (
    <div className='bg-bg-50 relative flex h-dvh flex-col'>
      <div className='bg-bg-0 pt-(--safe-area-inset-top,0px)'>
        <Header>
          <Header.Title>일과</Header.Title>
        </Header>
      </div>
      <main className='bg-bg-0 flex min-h-0 flex-1 flex-col'>
        <OwnerDailySummarySection dateLabel={dateLabel} summaryItems={summaryItems} />
        {isLoading ? (
          <div className='bg-bg-50 min-h-0 flex-1' />
        ) : isError ? (
          <div className='bg-bg-50 flex min-h-0 flex-1 items-center justify-center px-4 pb-(--bottom-bar-height)'>
            <div className='flex flex-col items-center gap-1 text-center'>
              <p className='h2-extrabold text-text-primary'>일과 정보를 불러오지 못했어요</p>
              <p className='body1-regular text-text-secondary'>잠시 후 다시 시도해 주세요.</p>
            </div>
          </div>
        ) : (
          <Tabs
            value={selectedTab}
            className='flex min-h-0 flex-1 flex-col'
            onValueChange={handleTabValueChange}
          >
            <TabsList>
              <TabsTrigger value='attendance-check'>등원 처리</TabsTrigger>
              <TabsTrigger value='today-attendance'>오늘 등원</TabsTrigger>
            </TabsList>
            <TabsContent
              ref={attendanceCheckContentRef}
              value='attendance-check'
              className='bg-bg-50 min-h-0 flex-1 overflow-y-auto pb-(--bottom-bar-height)'
              onScroll={(event) => handleContentScroll(event.currentTarget.scrollTop)}
            >
              <OwnerDailyTabContent
                items={attendanceCheckMembers}
                hasConnectedMembers={hasConnectedMembers}
                normalizedSearchKeyword={normalizedSearchKeyword}
                searchKeyword={searchKeyword}
                showBeforeFilter={showUncheckedOnly}
                onBeforeFilterClick={handleCheckFilterClick}
                onSearchKeywordChange={handleSearchKeywordChange}
                onClearSearchKeyword={handleClearSearchKeyword}
                onInviteGuardianClick={handleInviteGuardianClick}
                onMemberClick={handleMemberClick}
                onAttendanceButtonClick={handleAttendanceButtonClick}
              />
            </TabsContent>
            <TabsContent
              ref={todayAttendanceContentRef}
              value='today-attendance'
              className='bg-bg-50 min-h-0 flex-1 overflow-y-auto pb-(--bottom-bar-height)'
              onScroll={(event) => handleContentScroll(event.currentTarget.scrollTop)}
            >
              <TodayAttendanceTab
                items={todayAttendanceMembers}
                initialSelectedFilter={initialTodayAttendanceFilter}
                isLoading={isTodayLoading}
                isError={isTodayError}
                onCheckOutButtonClick={handleCheckOutButtonClick}
                onMemberClick={handleMemberClick}
                onNoticebookButtonClick={handleNoticebookButtonClick}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>
      {isScrollTopButtonVisible ? (
        <Float
          placement='bottom-end'
          offsetX='x4'
          offsetY='calc(var(--bottom-bar-height) + 20px)'
          zIndex={50}
        >
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
}

export { OwnerDailyPage };
