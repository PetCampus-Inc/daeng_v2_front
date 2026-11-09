const TAB = {
  USAGE: 'usage',
  GUARDIAN: 'guardian',
  ATTENDANCE: 'attendance',
} as const;

type OwnerMemberProfileTab = (typeof TAB)[keyof typeof TAB];

const ownerMemberProfileContent = {
  pageTitle: '원생 프로필',
  usageTabLabel: '이용 정보',
  guardianTabLabel: '보호자 정보',
  attendanceTabLabel: '등하원 기록',
  basicInfoTitle: '기본 정보',
  connectionHistoryTitle: '연결 내역',
  connectionHistoryErrorText: '연결 내역을 불러오지 못했어요',
  currentLabel: '현재',
  attendanceBadgePrefix: '등원',
  attendanceBadgeSuffix: '회',
  nameLabel: '이름',
  breedLabel: '견종',
  genderLabel: '성별',
  weightLabel: '몸무게',
  ageLabel: '나이',
  phoneLabel: '연락처',
  emergencyPhoneLabel: '비상 연락처',
  addressLabel: '주소',
  maleDogLabel: '남',
  femaleDogLabel: '여',
  maleGuardianLabel: '남',
  femaleGuardianLabel: '여',
  neuteredDoneLabel: '중성화 완료',
  neuteredNotDoneLabel: '중성화 안함',
  checkInLabel: '등원',
  checkOutLabel: '하원',
  conditionLabel: '컨디션',
  snackLabel: '간식',
  stoolStatusLabel: '배변 상태',
  attendanceEmptyText: '선택한 날짜에 등하원 기록이 없어요.',
  todayButtonLabel: '오늘',
  copyToastSuffix: '를 복사했어요',
  ticketChargeSuccessToast: '이용권 충전이 완료되었어요',
  profileLoadingText: '원생 프로필을 불러오는 중이에요',
  profileErrorText: '원생 프로필을 불러오지 못했어요',
  emptyValue: '-',
  disconnectDialog: {
    titleSuffix: '의 연결을 해제할까요?',
    description: '연결 해제 시 원생과 보호자 정보를 볼 수 없어요.',
    cancelLabel: '닫기',
    confirmLabel: '해제하기',
    /** 강아지명 말줄임 */
    nameMaxLength: 8,
  },
  /** 해제할 수 없을 때 보여주는 바텀시트 */
  disconnectBlockedSheet: {
    title: '아직 연결을 해제할 수 없어요.',
    ticketBody: '사용할 수 있는 이용권이 아직 남아 있어요.\n이용권을 삭제하거나 만료된 뒤 해제할 수 있어요.',
    reservationBody: '완료되지 않은 예약이 남아 있어요.\n예약한 날이 지나면 해제할 수 있어요.',
    confirmLabel: '확인',
    remainingCountSuffix: '회 남음',
    reservationTitleSuffix: ' 예약',
    reservationDescriptionSuffix: ' 등원 예정',
    reservationStatusLabel: '등원전',
  },
  disconnectSuccessToastSuffix: '의 유치원 연결이 해제되었어요',
  /** 해제 요청이 실패하거나 해제 가능 여부 조회가 실패했을 때 — 프로필 유지 */
  disconnectFailToast: '연결 해제를 완료하지 못했어요',
  /** 이미 해제된 원생일 때 */
  alreadyDisconnectedToast: '이미 연결을 해제한 원생이에요.',
};

function getGuardianGenderLabel(gender: string) {
  if (gender === 'FEMALE') return ownerMemberProfileContent.femaleGuardianLabel;
  if (gender === 'MALE') return ownerMemberProfileContent.maleGuardianLabel;
  return gender || ownerMemberProfileContent.emptyValue;
}

export {
  TAB,
  getGuardianGenderLabel,
  ownerMemberProfileContent,
  type OwnerMemberProfileTab,
};
