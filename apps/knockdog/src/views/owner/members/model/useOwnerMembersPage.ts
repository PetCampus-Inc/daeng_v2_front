import { useMemo, useState } from 'react';

import {
  OWNER_MEMBER_SEARCH_MAX_LENGTH,
  mockOwnerMembers,
  type OwnerMember,
  type OwnerMemberSortType,
} from '@views/owner/members/config/ownerMembersContent';

const SEARCH_ALLOWED_PATTERN = /[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z ]/g;

function sortOwnerMembers(members: OwnerMember[], sortType: OwnerMemberSortType) {
  return [...members].sort((currentMember, nextMember) => {
    if (sortType === 'recentAttendance') {
      return nextMember.recentAttendanceDate.localeCompare(currentMember.recentAttendanceDate);
    }

    return (
      currentMember.dogName.localeCompare(nextMember.dogName, 'ko') ||
      currentMember.guardianName.localeCompare(nextMember.guardianName, 'ko') ||
      currentMember.id.localeCompare(nextMember.id)
    );
  });
}

function useOwnerMembersPage() {
  const [sortType, setSortType] = useState<OwnerMemberSortType>('name');
  const [searchQuery, setSearchQuery] = useState('');

  const ownerMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filteredMembers = !query
      ? mockOwnerMembers
      : mockOwnerMembers.filter(
          (member) =>
            member.dogName.toLowerCase().includes(query) ||
            member.guardianName.toLowerCase().includes(query)
        );

    return sortOwnerMembers(filteredMembers, sortType);
  }, [searchQuery, sortType]);

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(
      value.replace(SEARCH_ALLOWED_PATTERN, '').slice(0, OWNER_MEMBER_SEARCH_MAX_LENGTH)
    );
  };

  const handleDisconnectMember = (memberId: string) => {
    // TODO: API 연동 시 memberId로 유치원 연결 해제 mutation 호출
    void memberId;
  };

  return {
    ownerMembers,
    totalMemberCount: mockOwnerMembers.length,
    searchQuery,
    handleSearchQueryChange,
    handleDisconnectMember,
    sortType,
    setSortType,
  };
}

export { useOwnerMembersPage };
