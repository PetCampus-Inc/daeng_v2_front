import { useMemo, useState } from 'react';
import {
  OWNER_MEMBER_SEARCH_MAX_LENGTH,
  type OwnerMemberSortType,
} from '@views/owner-members-page/config/ownerMembersContent';
import type { OwnerMembersEmptyStateType } from '@views/owner-members-page/config/ownerMembersEmptyContent';
import { useOwnerRole } from '@features/role-conversion';

import {
  useOwnerMemberDisconnectMutation,
  useOwnerMembersQuery,
  type OwnerMember,
} from '@entities/owner-member';
import { useUserStore } from '@entities/user';

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
  const disconnectMutation = useOwnerMemberDisconnectMutation({ userId });

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
  const isInitialPending =
    !isResolved || ownerMembersQuery.isLoading || !ownerMembersQuery.isFetchedAfterMount;
  const totalMemberCount = ownerMembersQuery.data?.totalMemberCount ?? 0;
  const hasSearchQuery = normalizeSearchText(searchQuery).length > 0;
  const emptyStateType: OwnerMembersEmptyStateType | null = (() => {
    if (isInitialPending) return null;
    if (totalMemberCount === 0) return 'emptyStudents';
    if (hasSearchQuery && ownerMembers.length === 0) return 'emptySearchResult';

    return null;
  })();

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(
      value.replace(SEARCH_ALLOWED_PATTERN, '').slice(0, OWNER_MEMBER_SEARCH_MAX_LENGTH)
    );
  };

  const handleDisconnectMember = async (memberId: string) => {
    await disconnectMutation.mutateAsync(memberId);
  };

  return {
    ownerMembers,
    totalMemberCount,
    emptyStateType,
    searchQuery,
    handleSearchQueryChange,
    handleDisconnectMember,
    sortType,
    setSortType,
    isLoading: isInitialPending,
    isError: ownerMembersQuery.isError,
    isDisconnectPending: disconnectMutation.isPending,
  };
}

export { useOwnerMembersPage };
