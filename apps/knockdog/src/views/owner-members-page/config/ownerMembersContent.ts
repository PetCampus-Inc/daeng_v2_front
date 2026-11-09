type OwnerMemberSortType = 'name' | 'recentAttendance';

const OWNER_MEMBER_SEARCH_MAX_LENGTH = 20;

const ownerMembersContent = {
  searchPlaceholder: '강아지명, 보호자명을 검색해 보세요',
  /** 오래된 목록에서 이미 해제된 원생 카드를 눌렀을 때 */
  alreadyDisconnectedToast: '이미 연결을 해제한 원생이에요.',
};

const SORT_OPTIONS: { value: OwnerMemberSortType; label: string }[] = [
  { value: 'name', label: '이름순' },
  { value: 'recentAttendance', label: '최근 등원일순' },
];

export { OWNER_MEMBER_SEARCH_MAX_LENGTH, SORT_OPTIONS, ownerMembersContent, type OwnerMemberSortType };
