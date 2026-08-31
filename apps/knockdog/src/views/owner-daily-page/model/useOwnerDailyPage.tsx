import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';

import type { AttendanceMember } from '@views/owner-daily-page/config/ownerDailyContent';
import {
  formatKstDateLabel,
  formatKstDayLabel,
  formatKstTimeLabel,
  getKstDateKey,
  getNextKstMidnightDelay,
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
import { trackAttendanceAction } from '@shared/lib/analytics';
import { useStackNavigation } from '@shared/lib/bridge';
import { useDebounced } from '@shared/lib';
import { ApiError, REQUEST_FAILED_MESSAGE } from '@shared/api';
import { toast } from '@shared/ui/toast';
import { getSubjectObjectParticle } from '@shared/utils';

const SEARCH_DEBOUNCE_MS = 300;

function normalizeSearchText(value: string) {
  return value.replace(/\s+/g, '').toLowerCase();
}

function formatAttendanceTime(value: string | null | undefined) {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return formatKstTimeLabel(date);
}

/** 등원 시각이 조회일(KST)과 같으면 당일 등원으로 인정 */
function isCheckInOnDate(checkInAt: string | null | undefined, dateKey: string) {
  if (!checkInAt) return false;
  const date = new Date(checkInAt);
  if (Number.isNaN(date.getTime())) return false;
  return getKstDateKey(date) === dateKey;
}

function toAttendanceMemberFromCandidate(
  candidate: AttendanceCheckinoutCandidate,
  dateKey: string
): AttendanceMember {
  // checkInAt이 있는데 당일이 아니면(전날 값이 남은 경우) 등원 전으로 취급.
  // checkInAt이 없는 경우는 상태 리셋 이슈가 아니라 필드 미기재일 뿐이므로 checkinoutStatus를 그대로 신뢰한다.
  const isStaleCheckIn =
    candidate.checkInAt != null && !isCheckInOnDate(candidate.checkInAt, dateKey);
  const checkedIn = candidate.checkinoutStatus !== 'NOT_CHECKED_IN' && !isStaleCheckIn;
  const checkedOut = checkedIn && candidate.checkinoutStatus === 'CHECKED_OUT';

  return {
    id: candidate.petId,
    name: candidate.name,
    gender: candidate.gender,
    breed: candidate.breed,
    weightKg: candidate.weightKg,
    birthYear: candidate.birthYear ?? undefined,
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
    birthYear: item.birthYear ?? undefined,
    profileImageUrl: item.profileImageUrl ?? undefined,
    checkedIn: true,
    checkedInTime: formatAttendanceTime(item.checkInAt),
    checkedOut,
    checkedOutTime: formatAttendanceTime(item.checkOutAt),
    noticebookSent: item.attendanceRecordSent,
  };
}

function getCancelCheckInBlockMessage(member: AttendanceMember) {
  if (member.checkedOut) return '이미 하원 처리 되어 등원을 취소할 수 없어요';
  if (member.noticebookSent) return '이미 알림장이 발송되어 등원을 취소할 수 없어요';

  return null;
}

function useOwnerDailyPage() {
  const { push } = useStackNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const [activeDate, setActiveDate] = useState(() => new Date());
  const todayDateKey = getKstDateKey(activeDate);
  const dateLabel = `${formatKstDateLabel(activeDate)} ${formatKstDayLabel(activeDate)}`;

  const [searchKeyword, setSearchKeyword] = useState('');
  const [showUncheckedOnly, setShowUncheckedOnly] = useState(false);
  const debouncedSearchKeyword = useDebounced(searchKeyword, SEARCH_DEBOUNCE_MS);
  const normalizedSearchKeyword = normalizeSearchText(searchKeyword);
  const candidatesSearchQuery = debouncedSearchKeyword.trim() || undefined;

  const refreshActiveDate = useCallback(() => {
    setActiveDate(new Date());
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      refreshActiveDate();
    }, getNextKstMidnightDelay(activeDate));

    return () => window.clearTimeout(timeout);
  }, [activeDate, refreshActiveDate]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      if (getKstDateKey(activeDate) === getKstDateKey(new Date())) return;
      refreshActiveDate();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeDate, refreshActiveDate]);

  const candidatesQuery = useAttendanceCheckinoutCandidatesQuery({
    date: todayDateKey,
    q: candidatesSearchQuery,
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

  const members = useMemo(() => {
    const noticebookSentByPetId = new Map(
      (todayQuery.data?.items ?? []).map((item) => [item.petId, item.attendanceRecordSent])
    );

    return (candidatesQuery.data?.items ?? []).map((candidate) => {
      const member = toAttendanceMemberFromCandidate(candidate, todayDateKey);

      return {
        ...member,
        noticebookSent: noticebookSentByPetId.get(candidate.petId) ?? false,
      };
    });
  }, [candidatesQuery.data?.items, todayDateKey, todayQuery.data?.items]);
  const todayAttendanceMembers = useMemo(
    () =>
      [...(todayQuery.data?.items ?? [])]
        // 전날 등원 시각이 남아 있으면 오늘 목록에서 제외
        .filter((item) => !item.checkInAt || isCheckInOnDate(item.checkInAt, todayDateKey))
        .map(toAttendanceMemberFromTodayItem)
        .sort((currentMember, nextMember) =>
          currentMember.name.localeCompare(nextMember.name, 'ko-KR')
        ),
    [todayDateKey, todayQuery.data?.items]
  );
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
  // 검색 중 빈 결과는 서버 필터 결과이므로 NoMembers가 아닌 SearchEmpty로 분기
  const hasConnectedMembers = sortedMembers.length > 0 || Boolean(normalizedSearchKeyword);
  const attendanceCheckMembers = showUncheckedOnly
    ? sortedMembers.filter((member) => !member.checkedIn)
    : sortedMembers;

  const isLoading =
    !userId ||
    ((candidatesQuery.isPending || summaryQuery.isPending) &&
      !candidatesQuery.data &&
      !summaryQuery.data);
  const isError = candidatesQuery.isError || summaryQuery.isError;
  const isTodayLoading = todayQuery.isPending;
  const isTodayError = todayQuery.isError;

  const showRequestFailureToast = () => {
    toast({
      title: REQUEST_FAILED_MESSAGE,
      nativeTitle: REQUEST_FAILED_MESSAGE,
    });
  };

  const showCancelCheckInFailureToast = (error: unknown) => {
    if (error instanceof ApiError) {
      switch (String(error.code)) {
        case 'ATTENDANCE_CHECKINOUT-409-2':
          toast({
            title: '이미 하원 처리 되어 등원을 취소할 수 없어요',
            nativeTitle: '이미 하원 처리 되어 등원을 취소할 수 없어요',
          });
          return;
        case 'ATTENDANCE_CHECKINOUT-409-3':
          toast({
            title: '이미 알림장이 발송되어 등원을 취소할 수 없어요',
            nativeTitle: '이미 알림장이 발송되어 등원을 취소할 수 없어요',
          });
          return;
      }
    }

    showRequestFailureToast();
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
      trackAttendanceAction({ action: 'check_in' });
      const checkInSuffix = `${getSubjectObjectParticle(member.name)} 등원 처리했어요`;
      toast({
        type: 'success',
        nativeTitle: `${member.name}${checkInSuffix}`,
        titleParts: [
          { text: member.name, accent: true },
          { text: checkInSuffix },
        ],
        title: (
          <>
            <span className='text-text-accent'>{member.name}</span>
            <span className='text-text-primary-inverse'>{checkInSuffix}</span>
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
      trackAttendanceAction({ action: 'cancel_check_in' });
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
    } catch (error) {
      showCancelCheckInFailureToast(error);
    }
  };

  const handleCheckOut = async (member: AttendanceMember) => {
    if (member.checkedOut) return;

    try {
      await checkOutMutation.mutateAsync({ petId: member.id, date: todayDateKey });
      trackAttendanceAction({ action: 'check_out' });
      const checkOutSuffix = `${getSubjectObjectParticle(member.name)} 하원 처리했어요`;
      toast({
        type: 'success',
        nativeTitle: `${member.name}${checkOutSuffix}`,
        titleParts: [
          { text: member.name, accent: true },
          { text: checkOutSuffix },
        ],
        title: (
          <>
            <span className='text-text-accent'>{member.name}</span>
            <span className='text-text-primary-inverse'>{checkOutSuffix}</span>
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
      trackAttendanceAction({ action: 'cancel_check_out' });
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
