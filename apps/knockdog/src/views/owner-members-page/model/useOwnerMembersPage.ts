import { useMemo, useState } from 'react';

import { useOwnerMembersQuery, type OwnerMember } from '@entities/owner-member';
import { useUserStore } from '@entities/user';
import { useOwnerRole } from '@features/role-conversion';
import {
  OWNER_MEMBER_SEARCH_MAX_LENGTH,
  type OwnerMemberSortType,
} from '@views/owner-members-page/config/ownerMembersContent';

const SEARCH_ALLOWED_PATTERN = /[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z ]/g;

function normalizeSearchText(value: string) {
  return value.replace(/\s/g, '').toLowerCase();
}

function sortOwnerMembers(members: OwnerMember[], sortType: OwnerMemberSortType) {
  return [...members].sort((currentMember, nextMember) => {
    if (sortType === 'recentAttendance') {
      return (nextMember.recentAttendanceDate ?? '').localeCompare(currentMember.recentAttendanceDate ?? '');
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
  const userId = useUserStore((state) => state.user?.userId);
  const { isOwner, isResolved } = useOwnerRole();
  const ownerMembersQuery = useOwnerMembersQuery({
    userId,
    enabled: isResolved && isOwner,
  });

  const ownerMembers = useMemo(() => {
    const query = normalizeSearchText(searchQuery);
    const members = ownerMembersQuery.data?.members ?? [];

    const filteredMembers = !query
      ? members
      : members.filter(
          (member) =>
            normalizeSearchText(member.dogName).includes(query) ||
            normalizeSearchText(member.guardianName).includes(query)
        );

    return sortOwnerMembers(filteredMembers, sortType);
  }, [ownerMembersQuery.data?.members, searchQuery, sortType]);

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
    totalMemberCount: ownerMembersQuery.data?.totalMemberCount ?? 0,
    searchQuery,
    handleSearchQueryChange,
    handleDisconnectMember,
    sortType,
    setSortType,
    isLoading: ownerMembersQuery.isLoading,
    isError: ownerMembersQuery.isError,
  };
}

export { useOwnerMembersPage };
