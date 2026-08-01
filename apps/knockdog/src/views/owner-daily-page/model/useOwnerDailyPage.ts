import { useMemo, useState, type ChangeEvent } from 'react';

import type { AttendanceMember } from '@views/owner-daily-page/config/ownerDailyContent';
import { useOwnerDailyAttendanceStore } from '@views/owner-daily-page/model/useOwnerDailyAttendanceStore';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';

function normalizeSearchText(value: string) {
  return value.replace(/\s+/g, '').toLowerCase();
}

function getCancelCheckInBlockMessage(member: AttendanceMember) {
  if (member.checkedOut) return '이미 하원 처리되어 등원을 취소할 수 없어요';
  if (member.noticebookSent) return '이미 알림장이 발송되어 등원을 취소할 수 없어요';

  return null;
}

function useOwnerDailyPage() {
  const { push } = useStackNavigation();
  const members = useOwnerDailyAttendanceStore((state) => state.members);
  const checkIn = useOwnerDailyAttendanceStore((state) => state.checkIn);
  const cancelStoredCheckIn = useOwnerDailyAttendanceStore((state) => state.cancelCheckIn);
  const checkOut = useOwnerDailyAttendanceStore((state) => state.checkOut);
  const cancelStoredCheckOut = useOwnerDailyAttendanceStore((state) => state.cancelCheckOut);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showUncheckedOnly, setShowUncheckedOnly] = useState(false);

  const normalizedSearchKeyword = normalizeSearchText(searchKeyword);
  const checkedInMembers = members.filter((member) => member.checkedIn);
  const checkedOutMembers = checkedInMembers.filter((member) => member.checkedOut);
  const pendingNoticebookMembers = checkedInMembers.filter((member) => !member.noticebookSent);
  const summaryItems = [
    { label: '오늘 등원', count: checkedInMembers.length },
    { label: '재원 중', count: checkedInMembers.length - checkedOutMembers.length },
    { label: '알림장 발송 전', count: pendingNoticebookMembers.length },
  ];
  const sortedMembers = useMemo(
    () => [...members].sort((currentMember, nextMember) => currentMember.name.localeCompare(nextMember.name, 'ko-KR')),
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
  const todayAttendanceMembers = sortedMembers.filter((member) => member.checkedIn);

  const showRequestFailureToast = () => {
    toast({
      title: '일시적 오류로 요청을 완료하지 못했어요',
      nativeTitle: '일시적 오류로 요청을 완료하지 못했어요',
    });
  };

  const sendAttendancePush = async (
    _member: AttendanceMember,
    _type: 'check-in' | 'cancel-check-in' | 'check-out' | 'cancel-check-out'
  ) => {
    // TODO: 실제 API 계약 연결 시 보호자 푸시 발송 mutation을 여기에서 호출합니다.
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
    push({ pathname: `/owner/members/${memberId}` }).catch(showRequestFailureToast);
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
    push({ pathname: '/owner/members' }).catch(showRequestFailureToast);
  };

  const handleCheckIn = async (member: AttendanceMember) => {
    try {
      await sendAttendancePush(member, 'check-in');
      checkIn(member.id);
      toast({
        title: `✓ ${member.name}를 등원 처리했어요`,
        nativeTitle: `✓ ${member.name}를 등원 처리했어요`,
      });
    } catch {
      showRequestFailureToast();
    }
  };

  const cancelCheckIn = async (member: AttendanceMember, close: () => void) => {
    try {
      await sendAttendancePush(member, 'cancel-check-in');
      cancelStoredCheckIn(member.id);
      close();
      toast({
        title: `✓ ${member.name}의 등원을 취소했어요`,
        nativeTitle: `✓ ${member.name}의 등원을 취소했어요`,
      });
    } catch {
      showRequestFailureToast();
    }
  };

  const handleCheckOut = async (member: AttendanceMember) => {
    if (member.checkedOut) return;

    try {
      await sendAttendancePush(member, 'check-out');
      checkOut(member.id);
      toast({
        title: `✓ ${member.name}를 하원 처리했어요`,
        nativeTitle: `✓ ${member.name}를 하원 처리했어요`,
      });
    } catch {
      showRequestFailureToast();
    }
  };

  const cancelCheckOut = async (member: AttendanceMember, close: () => void) => {
    if (!member.checkedOut) return;

    try {
      await sendAttendancePush(member, 'cancel-check-out');
      cancelStoredCheckOut(member.id);
      close();
      toast({
        title: `✓ ${member.name}의 하원을 취소했어요`,
        nativeTitle: `✓ ${member.name}의 하원을 취소했어요`,
      });
    } catch {
      showRequestFailureToast();
    }
  };

  const handleNoticebookButtonClick = (member: AttendanceMember) => {
    push({ pathname: route.owner.daily.notice.write.root.replace('[id]', member.id) }).catch(showRequestFailureToast);
  };

  return {
    attendanceCheckMembers,
    cancelCheckOut,
    cancelCheckIn,
    canOpenCancelCheckInDialog,
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
  };
}

export { useOwnerDailyPage };
