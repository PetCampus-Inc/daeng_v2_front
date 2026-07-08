type OwnerMemberSortType = 'name' | 'recentAttendance';

const OWNER_MEMBER_SEARCH_MAX_LENGTH = 20;

const ownerMembersContent = {
  searchPlaceholder: '강아지명, 보호자명을 검색해 보세요',
};

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
    recentAttendanceDate: '2026-07-07',
  },
  {
    id: '2',
    dogName: '강얼쥐',
    guardianName: '최수현',
    profileImageUrl: '',
    recentAttendanceDate: '2026-07-05',
  },
  {
    id: '3',
    dogName: '니콜락스',
    guardianName: '김민지',
    profileImageUrl: '',
    recentAttendanceDate: '2026-07-06',
  },
  {
    id: '4',
    dogName: '두리안',
    guardianName: '박상순',
    profileImageUrl: '',
    recentAttendanceDate: '2026-07-02',
  },
  {
    id: '5',
    dogName: '보리',
    guardianName: '김상수',
    profileImageUrl: '',
    recentAttendanceDate: '2026-07-01',
  },
  {
    id: '6',
    dogName: '밥풀',
    guardianName: '강미나',
    profileImageUrl: '',
    recentAttendanceDate: '2026-06-30',
  },
  {
    id: '7',
    dogName: '호두',
    guardianName: '강민제',
    profileImageUrl: '',
    recentAttendanceDate: '2026-06-29',
  },
  {
    id: '8',
    dogName: '라리',
    guardianName: '배라리',
    profileImageUrl: '',
    recentAttendanceDate: '2026-06-28',
  },
  {
    id: '9',
    dogName: '호두마루',
    guardianName: '마루',
    profileImageUrl: '',
    recentAttendanceDate: '2026-06-27',
  },
];

export type OwnerMember = (typeof mockOwnerMembers)[number];
export { OWNER_MEMBER_SEARCH_MAX_LENGTH, SORT_OPTIONS, ownerMembersContent, type OwnerMemberSortType };
