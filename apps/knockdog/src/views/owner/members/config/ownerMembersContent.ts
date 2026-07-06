type OwnerMemberSortType = 'name' | 'recentAttendance';

const SORT_OPTIONS: { value: OwnerMemberSortType; label: string }[] = [
  { value: 'name', label: '이름순' },
  { value: 'recentAttendance', label: '최근 등원일순' },
];

export const mockOwnerMembers = [
  {
    id: '1',
    dogName: '가나다',
    guardianName: '박민수',
    profileImageUrl: '',
  },
  {
    id: '2',
    dogName: '강얼쥐',
    guardianName: '최수현',
    profileImageUrl: '',
  },
  {
    id: '3',
    dogName: '니콜락스',
    guardianName: '김민지',
    profileImageUrl: '',
  },
  {
    id: '4',
    dogName: '두리안',
    guardianName: '박상순',
    profileImageUrl: '',
  },
  {
    id: '5',
    dogName: '보리',
    guardianName: '김상수',
    profileImageUrl: '',
  },
  {
    id: '6',
    dogName: '뽀삐',
    guardianName: '강미나',
    profileImageUrl: '',
  },
  {
    id: '7',
    dogName: '뽀삐',
    guardianName: '강미나77',
    profileImageUrl: '',
  },
  {
    id: '8',
    dogName: '뽀삐',
    guardianName: '강미나88',
    profileImageUrl: '',
  },
  {
    id: '9',
    dogName: '뽀삐99',
    guardianName: '강미나',
    profileImageUrl: '',
  },
];

export type OwnerMember = (typeof mockOwnerMembers)[number];
export { SORT_OPTIONS, type OwnerMemberSortType };
