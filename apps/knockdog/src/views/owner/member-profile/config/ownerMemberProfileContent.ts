const TAB = {
  DOG: 'dog',
  GUARDIAN: 'guardian',
  ATTENDANCE: 'attendance',
} as const;

type OwnerMemberProfileTab = (typeof TAB)[keyof typeof TAB];

const ownerMemberProfileContent = {
  pageTitle: '원생 프로필',
  dogTabLabel: '강아지 정보',
  guardianTabLabel: '보호자 정보',
  attendanceTabLabel: '등하원 기록',
  basicInfoTitle: '기본 정보',
  nameLabel: '이름',
  breedLabel: '견종',
  genderLabel: '성별',
  weightLabel: '몸무게',
  ageLabel: '나이',
  phoneLabel: '연락처',
  emergencyPhoneLabel: '비상 연락처',
  addressLabel: '주소',
  maleDogLabel: '남자아이',
  femaleDogLabel: '여자아이',
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
  profileLoadingText: '원생 프로필을 불러오는 중이에요',
  profileErrorText: '원생 프로필을 불러오지 못했어요',
  emptyValue: '-',
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
