import {
  STOOL_STATUS,
  STOOL_STATUS_LABEL,
  type StoolStatus,
} from '@shared/ui/stool-status';

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
  checkInLabel: '등원',
  checkOutLabel: '하원',
  conditionLabel: '컨디션',
  snackLabel: '간식',
  stoolStatusLabel: '배변 상태',
  attendanceEmptyText: '등하원 기록이 없어요',
  copyToastSuffix: '를 복사했어요',
};

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

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

interface OwnerMemberAttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  condition: string;
  snack: string;
  stoolStatus: StoolStatus;
  note: string;
}

interface OwnerMemberProfile {
  id: string;
  dog: OwnerMemberProfileDog;
  guardian: OwnerMemberProfileGuardian;
  attendanceRecords: OwnerMemberAttendanceRecord[];
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
    attendanceRecords: [
      {
        date: '2026-06-05',
        checkIn: '오전 9:10',
        checkOut: '오후 6:00',
        condition: '평소와 비슷했어요',
        snack: '간식을 잘 먹었어요.',
        stoolStatus: STOOL_STATUS.HARD,
        note: '오늘도 잘 지냈어요.',
      },
      {
        date: '2026-06-06',
        checkIn: '오전 9:05',
        checkOut: '오후 6:20',
        condition: '평소와 비슷했어요',
        snack: '북어트릿을 먹었어요.',
        stoolStatus: STOOL_STATUS.HARD,
        note: '친구들과 잘 놀았어요.',
      },
      {
        date: '2026-06-08',
        checkIn: '오전 9:00',
        checkOut: '오후 6:30',
        condition: '평소와 비슷했어요',
        snack: '단호박 큐브와 북어트릿 한 조각을 먹었어요.',
        stoolStatus: STOOL_STATUS.HARD,
        note: '안녕하세요 뭉치 어머니! 뭉치가 오늘 친구들과 운동장에서 아주 활발하게 뛰어놀았어요. 특히 보더콜리 친구와 공놀이하는 걸 무척 좋아하더라고요! 점심도 남김없이 다 먹었고, 오후 낮잠 시간에는 아주 깊게 잠들었습니다. 집에 가서 푹 쉴 수 있게 해주세요!!',
      },
    ],
  },
];

function getMockOwnerMemberProfile(id: string): OwnerMemberProfile {
  const matched = mockOwnerMemberProfiles.find((profile) => profile.id === id);
  if (matched) return matched;

  return { ...mockOwnerMemberProfiles[0]!, id };
}

export {
  TAB,
  WEEKDAY_LABELS,
  STOOL_STATUS,
  STOOL_STATUS_LABEL,
  getMockOwnerMemberProfile,
  ownerMemberProfileContent,
  type OwnerMemberAttendanceRecord,
  type OwnerMemberProfile,
  type OwnerMemberProfileTab,
  type StoolStatus,
};
