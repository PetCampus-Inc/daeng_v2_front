import { useMemo, useState, type ChangeEvent } from 'react';

import { INITIAL_MEMBERS, type AttendanceMember } from '@views/owner-daily-page/config/ownerDailyContent';

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
  const [members, setMembers] = useState(INITIAL_MEMBERS);
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

  const showRequestFailureToast = () => {
    toast({
      title: '일시적 오류로 요청을 완료하지 못했어요',
      nativeTitle: '일시적 오류로 요청을 완료하지 못했어요',
    });
  };

  const sendAttendancePush = async (_member: AttendanceMember, _type: 'check-in' | 'cancel-check-in') => {
    // TODO: 실제 API 계약 연결 시 보호자 푸시 발송 mutation을 여기에서 호출합니다.
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
      setMembers((prevMembers) =>
        prevMembers.map((prevMember) => (prevMember.id === member.id ? { ...prevMember, checkedIn: true } : prevMember))
      );
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
      setMembers((prevMembers) =>
        prevMembers.map((prevMember) =>
          prevMember.id === member.id ? { ...prevMember, checkedIn: false } : prevMember
        )
      );
      close();
      toast({
        title: `✓ ${member.name}의 등원을 취소했어요`,
        nativeTitle: `✓ ${member.name}의 등원을 취소했어요`,
      });
    } catch {
      showRequestFailureToast();
    }
  };

  return {
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
  };
}

export { useOwnerDailyPage };
