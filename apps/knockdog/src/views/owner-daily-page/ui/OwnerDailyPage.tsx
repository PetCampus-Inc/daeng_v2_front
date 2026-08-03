'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { Float, FloatingActionButton, Tabs, TabsContent, TabsList, TabsTrigger } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { OWNER_DAILY_DATE_LABEL, type AttendanceMember } from '@views/owner-daily-page/config/ownerDailyContent';
import { OwnerDailyCancelCheckOutDialog } from '@views/owner-daily-page/ui/OwnerDailyCancelCheckOutDialog';
import { OwnerDailyCancelCheckInDialog } from '@views/owner-daily-page/ui/OwnerDailyCancelCheckInDialog';
import { useOwnerDailyPage } from '@views/owner-daily-page/model/useOwnerDailyPage';
import { OwnerDailySummarySection } from '@views/owner-daily-page/ui/OwnerDailySummarySection';
import { OwnerDailyTabContent } from '@views/owner-daily-page/ui/OwnerDailyTabContent';
import { TodayAttendanceTab } from '@views/owner-daily-page/ui/TodayAttendanceTab';
import { Header } from '@widgets/Header';

type OwnerDailyTab = 'attendance-check' | 'today-attendance';

function OwnerDailyPage() {
  const [selectedTab, setSelectedTab] = useState<OwnerDailyTab>('attendance-check');
  const attendanceCheckContentRef = useRef<HTMLDivElement>(null);
  const todayAttendanceContentRef = useRef<HTMLDivElement>(null);
  const {
    attendanceCheckMembers,
    canOpenCancelCheckInDialog,
    cancelCheckOut,
    cancelCheckIn,
    handleCheckFilterClick,
    handleCheckIn,
    handleCheckOut,
    handleClearSearchKeyword,
    handleInviteGuardianClick,
    handleMemberClick,
    handleNoticebookButtonClick,
    handleSearchKeywordChange,
    hasConnectedMembers,
    normalizedSearchKeyword,
    searchKeyword,
    showUncheckedOnly,
    summaryItems,
    todayAttendanceMembers,
  } = useOwnerDailyPage();

  const handleCancelCheckIn = (member: AttendanceMember) => {
    if (!canOpenCancelCheckInDialog(member)) return;

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

  const handleCancelCheckOut = (member: AttendanceMember) => {
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
    setSelectedTab(value as OwnerDailyTab);
  };

  const handleScrollToTop = () => {
    const contentRef = selectedTab === 'today-attendance' ? todayAttendanceContentRef : attendanceCheckContentRef;
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useLayoutEffect(() => {
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
        <OwnerDailySummarySection dateLabel={OWNER_DAILY_DATE_LABEL} summaryItems={summaryItems} />
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
          >
            <TodayAttendanceTab
              items={todayAttendanceMembers}
              onCheckOutButtonClick={handleCheckOutButtonClick}
              onMemberClick={handleMemberClick}
              onNoticebookButtonClick={handleNoticebookButtonClick}
            />
          </TabsContent>
        </Tabs>
      </main>
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
    </div>
  );
}

export { OwnerDailyPage };
