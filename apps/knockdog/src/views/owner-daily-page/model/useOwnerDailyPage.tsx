import { useMemo, useState, type ChangeEvent } from 'react';

import type { AttendanceMember } from '@views/owner-daily-page/config/ownerDailyContent';
import {
  formatKstDateLabel,
  formatKstDayLabel,
  formatKstTimeLabel,
  getKstDateKey,
} from '@views/owner-daily-page/lib/ownerDailyDate';

import {
  useAttendanceCheckinoutCandidatesQuery,
  useAttendanceCheckinoutMutation,
  useAttendanceCheckinoutSummaryQuery,
  useAttendanceCheckinoutTodayQuery,
  type AttendanceCheckinoutCandidate,
  type AttendanceCheckinoutTodayItem,
} from '@entities/owner-attendance-checkinout';
import { useUserStore } from '@entities/user';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';

function normalizeSearchText(value: string) {
  return value.replace(/\s+/g, '').toLowerCase();
}

function formatAttendanceTime(value: string | null | undefined) {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return formatKstTimeLabel(date);
}

function toAttendanceMemberFromCandidate(
  candidate: AttendanceCheckinoutCandidate
): AttendanceMember {
  const checkedIn = candidate.checkinoutStatus !== 'NOT_CHECKED_IN';
  const checkedOut = candidate.checkinoutStatus === 'CHECKED_OUT';

  return {
    id: candidate.petId,
    name: candidate.name,
    gender: candidate.gender,
    breed: candidate.breed,
    weightKg: candidate.weightKg,
    age: candidate.age ?? undefined,
    profileImageUrl: candidate.profileImageUrl ?? undefined,
    checkedIn,
    checkedOut,
    noticebookSent: false,
  };
}

function toAttendanceMemberFromTodayItem(item: AttendanceCheckinoutTodayItem): AttendanceMember {
  const checkedOut = item.checkinoutStatus === 'CHECKED_OUT';

  return {
    id: item.petId,
    name: item.name,
    gender: item.gender,
    breed: item.breed,
    weightKg: item.weightKg,
    age: item.age ?? undefined,
    profileImageUrl: item.profileImageUrl ?? undefined,
    checkedIn: true,
    checkedInTime: formatAttendanceTime(item.checkInAt),
    checkedOut,
    checkedOutTime: formatAttendanceTime(item.checkOutAt),
    noticebookSent: item.attendanceRecordSent,
  };
}

function getCancelCheckInBlockMessage(member: AttendanceMember) {
  if (member.checkedOut) return '이미 하원 처리되어 등원을 취소할 수 없어요';
  if (member.noticebookSent) return '이미 알림장이 발송되어 등원을 취소할 수 없어요';

  return null;
}

function useOwnerDailyPage() {
  const { push } = useStackNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const todayDateKey = getKstDateKey(new Date());
  const dateLabel = `${formatKstDateLabel(new Date())} ${formatKstDayLabel(new Date())}`;

  const candidatesQuery = useAttendanceCheckinoutCandidatesQuery({
    date: todayDateKey,
    userId,
    enabled: Boolean(userId),
  });
  const todayQuery = useAttendanceCheckinoutTodayQuery({
    date: todayDateKey,
    userId,
    enabled: Boolean(userId),
  });
  const summaryQuery = useAttendanceCheckinoutSummaryQuery({
    date: todayDateKey,
    userId,
    enabled: Boolean(userId),
  });
  const {
    checkInMutation,
    checkOutMutation,
    cancelCheckInMutation,
    cancelCheckOutMutation,
  } = useAttendanceCheckinoutMutation({ userId });

  const [searchKeyword, setSearchKeyword] = useState('');
  const [showUncheckedOnly, setShowUncheckedOnly] = useState(false);

  const members = useMemo(
    () => (candidatesQuery.data?.items ?? []).map(toAttendanceMemberFromCandidate),
    [candidatesQuery.data?.items]
  );
  const todayAttendanceMembers = useMemo(
    () =>
      [...(todayQuery.data?.items ?? []).map(toAttendanceMemberFromTodayItem)].sort(
        (currentMember, nextMember) => currentMember.name.localeCompare(nextMember.name, 'ko-KR')
      ),
    [todayQuery.data?.items]
  );
  const normalizedSearchKeyword = normalizeSearchText(searchKeyword);
  const summaryItems = [
    { label: '오늘 등원', count: summaryQuery.data?.checkedInCount ?? 0 },
    { label: '재원 중', count: summaryQuery.data?.currentlyInCount ?? 0 },
    { label: '알림장 발송 전', count: summaryQuery.data?.unsentAttendanceRecordCount ?? 0 },
  ];
  const sortedMembers = useMemo(
    () =>
      [...members].sort((currentMember, nextMember) =>
        currentMember.name.localeCompare(nextMember.name, 'ko-KR')
      ),
    [members]
  );
  const hasConnectedMembers = sortedMembers.length > 0;
  const searchedMembers = useMemo(() => {
    if (!normalizedSearchKeyword) return sortedMembers;

    return sortedMembers.filter((member) =>
      [member.name, member.guardianName ?? '']
        .map(normalizeSearchText)
        .some((searchTarget) => searchTarget.includes(normalizedSearchKeyword))
    );
  }, [normalizedSearchKeyword, sortedMembers]);
  const attendanceCheckMembers = showUncheckedOnly
    ? searchedMembers.filter((member) => !member.checkedIn)
    : searchedMembers;

  const isLoading = !userId || candidatesQuery.isPending || summaryQuery.isPending;
  const isError = candidatesQuery.isError || summaryQuery.isError;
  const isTodayLoading = todayQuery.isPending;
  const isTodayError = todayQuery.isError;

  const showRequestFailureToast = () => {
    toast({
      title: '일시적 오류로 요청을 완료하지 못했어요',
      nativeTitle: '일시적 오류로 요청을 완료하지 못했어요',
    });
  };

  const canOpenCancelCheckInDialog = (member: AttendanceMember) => {
    const blockMessage = getCancelCheckInBlockMessage(member);
    if (!blockMessage) return true;

    toast({
      title: blockMessage,
      nativeTitle: blockMessage,
    });

    return false;
  };

  const handleMemberClick = (memberId: string) => {
    push({ pathname: route.owner.members.detail.root.replace('[id]', memberId) }).catch(
      showRequestFailureToast
    );
  };

  const handleSearchKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value);
    setShowUncheckedOnly(false);
  };

  const handleClearSearchKeyword = () => {
    setSearchKeyword('');
  };

  const handleCheckFilterClick = () => {
    setShowUncheckedOnly((prevShowUncheckedOnly) => !prevShowUncheckedOnly);
  };

  const handleInviteGuardianClick = () => {
    push({ pathname: route.owner.members.root }).catch(showRequestFailureToast);
  };

  const handleCheckIn = async (member: AttendanceMember) => {
    try {
      await checkInMutation.mutateAsync({ petId: member.id, date: todayDateKey });
      toast({
        type: 'success',
        nativeTitle: `${member.name}를 등원 처리했어요`,
        titleParts: [
          { text: member.name, accent: true },
          { text: '를 등원 처리했어요' },
        ],
        title: (
          <>
            <span className='text-text-accent'>{member.name}</span>
            <span className='text-text-primary-inverse'>를 등원 처리했어요</span>
          </>
        ),
      });
    } catch {
      showRequestFailureToast();
    }
  };

  const cancelCheckIn = async (member: AttendanceMember, close: () => void) => {
    try {
      await cancelCheckInMutation.mutateAsync({ petId: member.id, date: todayDateKey });
      close();
      toast({
        type: 'success',
        nativeTitle: `${member.name}의 등원을 취소했어요`,
        titleParts: [
          { text: member.name, accent: true },
          { text: '의 등원을 취소했어요' },
        ],
        title: (
          <>
            <span className='text-text-accent'>{member.name}</span>
            <span className='text-text-primary-inverse'>의 등원을 취소했어요</span>
          </>
        ),
      });
    } catch {
      showRequestFailureToast();
    }
  };

  const handleCheckOut = async (member: AttendanceMember) => {
    if (member.checkedOut) return;

    try {
      await checkOutMutation.mutateAsync({ petId: member.id, date: todayDateKey });
      toast({
        type: 'success',
        nativeTitle: `${member.name}를 하원 처리했어요`,
        titleParts: [
          { text: member.name, accent: true },
          { text: '를 하원 처리했어요' },
        ],
        title: (
          <>
            <span className='text-text-accent'>{member.name}</span>
            <span className='text-text-primary-inverse'>를 하원 처리했어요</span>
          </>
        ),
      });
    } catch {
      showRequestFailureToast();
    }
  };

  const cancelCheckOut = async (member: AttendanceMember, close: () => void) => {
    if (!member.checkedOut) return;

    try {
      await cancelCheckOutMutation.mutateAsync({ petId: member.id, date: todayDateKey });
      close();
      toast({
        type: 'success',
        nativeTitle: `${member.name}의 하원을 취소했어요`,
        titleParts: [
          { text: member.name, accent: true },
          { text: '의 하원을 취소했어요' },
        ],
        title: (
          <>
            <span className='text-text-accent'>{member.name}</span>
            <span className='text-text-primary-inverse'>의 하원을 취소했어요</span>
          </>
        ),
      });
    } catch {
      showRequestFailureToast();
    }
  };

  const handleNoticebookButtonClick = (member: AttendanceMember) => {
    push({ pathname: route.owner.daily.notice.write.root.replace('[id]', member.id) }).catch(
      showRequestFailureToast
    );
  };

  return {
    attendanceCheckMembers,
    cancelCheckOut,
    cancelCheckIn,
    canOpenCancelCheckInDialog,
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
  };
}

export { useOwnerDailyPage };
