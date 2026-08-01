'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { OWNER_DAILY_DATE_LABEL, type AttendanceMember } from '@views/owner-daily-page/config/ownerDailyContent';
import { OwnerDailyCancelCheckInDialog } from '@views/owner-daily-page/ui/OwnerDailyCancelCheckInDialog';
import { useOwnerDailyPage } from '@views/owner-daily-page/model/useOwnerDailyPage';
import { OwnerDailySummarySection } from '@views/owner-daily-page/ui/OwnerDailySummarySection';
import { OwnerDailyTabContent } from '@views/owner-daily-page/ui/OwnerDailyTabContent';
import { TodayAttendanceTab } from '@views/owner-daily-page/ui/TodayAttendanceTab';
import { Header } from '@widgets/Header';

import { toast } from '@shared/ui/toast';

function OwnerDailyPage() {
  const {
    attendanceCheckMembers,
    cancelCheckIn,
    getCancelCheckInBlockMessage,
    handleCheckFilterClick,
    handleCheckIn,
    handleClearSearchKeyword,
    handleInviteGuardianClick,
    handleMemberClick,
    handleSearchKeywordChange,
    hasConnectedMembers,
    normalizedSearchKeyword,
    searchKeyword,
    showUncheckedOnly,
    summaryItems,
  } = useOwnerDailyPage();

  const handleCancelCheckIn = (member: AttendanceMember) => {
    const blockMessage = getCancelCheckInBlockMessage(member);
    if (blockMessage) {
      toast({
        title: blockMessage,
        nativeTitle: blockMessage,
      });
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

  return (
    <div className='bg-bg-50 flex h-dvh flex-col'>
      <div className='bg-bg-0 pt-(--safe-area-inset-top,0px)'>
        <Header>
          <Header.Title>일과</Header.Title>
        </Header>
      </div>
      <main className='bg-bg-0 flex min-h-0 flex-1 flex-col'>
        <OwnerDailySummarySection dateLabel={OWNER_DAILY_DATE_LABEL} summaryItems={summaryItems} />
        <Tabs defaultValue='attendance-check' className='flex min-h-0 flex-1 flex-col'>
          <TabsList>
            <TabsTrigger value='attendance-check'>등원 처리</TabsTrigger>
            <TabsTrigger value='today-attendance'>오늘 등원</TabsTrigger>
          </TabsList>
          <TabsContent
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
            value='today-attendance'
            className='bg-bg-50 min-h-0 flex-1 overflow-y-auto pb-(--bottom-bar-height)'
          >
            <TodayAttendanceTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export { OwnerDailyPage };
