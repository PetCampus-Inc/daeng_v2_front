import { useMemo, useState } from 'react';

import {
  OWNER_MEMBER_SEARCH_MAX_LENGTH,
  mockOwnerMembers,
  type OwnerMemberSortType,
} from '@views/owner/members/config/ownerMembersContent';

const SEARCH_ALLOWED_PATTERN = /[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z ]/g;

function useOwnerMembersPage() {
  const [sortType, setSortType] = useState<OwnerMemberSortType>('name');
  const [searchQuery, setSearchQuery] = useState('');

  const ownerMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return mockOwnerMembers;

    return mockOwnerMembers.filter(
      (member) =>
        member.dogName.toLowerCase().includes(query) ||
        member.guardianName.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(
      value.replace(SEARCH_ALLOWED_PATTERN, '').slice(0, OWNER_MEMBER_SEARCH_MAX_LENGTH)
    );
  };

  return {
    ownerMembers,
    totalMemberCount: mockOwnerMembers.length,
    searchQuery,
    handleSearchQueryChange,
    sortType,
    setSortType,
  };
}

export { useOwnerMembersPage };
