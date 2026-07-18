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
  neuteredDoneLabel: '중성화 완료',
  neuteredNotDoneLabel: '중성화 안함',
  copyToastSuffix: '를 복사했어요',
};

interface OwnerMemberProfileDog {
  name: string;
  gender: 'MALE' | 'FEMALE';
  breed: string;
  weightKg: number;
  age: number;
  birthYear: number;
  isNeutered: boolean;
  profileImageUrl?: string;
}

interface OwnerMemberProfileGuardian {
  name: string;
  gender: string;
  phone: string;
  emergencyPhone: string;
  address: string;
  addressDetail?: string;
}

interface OwnerMemberProfile {
  id: string;
  dog: OwnerMemberProfileDog;
  guardian: OwnerMemberProfileGuardian;
}

/** TODO: API 연동 시 제거 */
const mockOwnerMemberProfiles: OwnerMemberProfile[] = [
  {
    id: '1',
    dog: {
      name: '뭉치',
      gender: 'MALE',
      breed: '비글',
      weightKg: 8,
      age: 3,
      birthYear: 2020,
      isNeutered: true,
      profileImageUrl: '',
    },
    guardian: {
      name: '김영진',
      gender: '남',
      phone: '010-1234-5678',
      emergencyPhone: '010-1234-5678',
      address: '서울특별시 강남구 테헤란로 123, 행복아파트 101동',
      addressDetail: '202호',
    },
  },
];

function getMockOwnerMemberProfile(id: string): OwnerMemberProfile {
  const matched = mockOwnerMemberProfiles.find((profile) => profile.id === id);
  if (matched) return matched;

  return { ...mockOwnerMemberProfiles[0]!, id };
}

export {
  TAB,
  getMockOwnerMemberProfile,
  ownerMemberProfileContent,
  type OwnerMemberProfile,
  type OwnerMemberProfileTab,
};
