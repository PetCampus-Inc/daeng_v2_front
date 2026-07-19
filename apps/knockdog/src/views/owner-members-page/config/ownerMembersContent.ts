type OwnerMemberSortType = 'name' | 'recentAttendance';

const OWNER_MEMBER_SEARCH_MAX_LENGTH = 20;

const ownerMembersContent = {
  searchPlaceholder: '강아지명, 보호자명을 검색해 보세요',
};

const SORT_OPTIONS: { value: OwnerMemberSortType; label: string }[] = [
  { value: 'name', label: '이름순' },
  { value: 'recentAttendance', label: '최근 등원일순' },
];

export { OWNER_MEMBER_SEARCH_MAX_LENGTH, SORT_OPTIONS, ownerMembersContent, type OwnerMemberSortType };
