import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { OWNER_MEMBER_SEARCH_MAX_LENGTH } from '@views/owner-members-page/config/ownerMembersContent';
import type { OwnerMembersEmptyStateType } from '@views/owner-members-page/config/ownerMembersEmptyContent';
import { hasListLoadFailed } from '@views/owner-members-page/lib/hasListLoadFailed';
import { useOwnerRole } from '@features/role-conversion';

import {
  OWNER_MEMBERS_TAB,
  OWNER_MEMBERS_TAB_QUERY_KEY,
  useOwnerMembersQuery,
  type OwnerMembersFilter,
  type OwnerMembersTab,
} from '@entities/owner-member';
import { useUserStore } from '@entities/user';

const SEARCH_ALLOWED_PATTERN = /[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z ]/g;

/** 주소의 `tab` 값으로 처음 열 탭을 정한다. 알 수 없는 값은 등록 원생 탭 */
function resolveInitialTab(value: string | null): OwnerMembersTab {
  return value === OWNER_MEMBERS_TAB.pending ? OWNER_MEMBERS_TAB.pending : OWNER_MEMBERS_TAB.registered;
}

function useOwnerMembersPage() {
  const searchParams = useSearchParams();
  const [selectedTab, setSelectedTab] = useState<OwnerMembersTab>(() =>
    resolveInitialTab(searchParams.get(OWNER_MEMBERS_TAB_QUERY_KEY))
  );
  const [selectedFilter, setSelectedFilter] = useState<OwnerMembersFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const userId = useUserStore((state) => state.user?.userId);
  const { isOwner, isResolved } = useOwnerRole();
  const keyword = searchQuery.trim();
  const ownerMembersQuery = useOwnerMembersQuery({
    userId,
    keyword,
    filter: selectedFilter,
    enabled: isResolved && isOwner,
  });

  const ownerMembers = ownerMembersQuery.data?.members ?? [];
  const counts = ownerMembersQuery.data?.counts ?? { all: 0, expiring: 0, expired: 0 };
  const isLoadFailed = hasListLoadFailed(ownerMembersQuery);
  const isInitialPending =
    !isLoadFailed && (!isResolved || ownerMembersQuery.isLoading || !ownerMembersQuery.isFetchedAfterMount);
  const emptyStateType: OwnerMembersEmptyStateType | null = (() => {
    if (isInitialPending) return null;
    if (counts.all === 0) return 'emptyStudents';
    if (ownerMembers.length > 0) return null;
    if (keyword) return 'emptySearchResult';
    if (selectedFilter === 'EXPIRING') return 'emptyExpiring';
    if (selectedFilter === 'EXPIRED') return 'emptyExpired';

    return null;
  })();

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value.replace(SEARCH_ALLOWED_PATTERN, '').slice(0, OWNER_MEMBER_SEARCH_MAX_LENGTH));
  };

  return {
    selectedTab,
    setSelectedTab,
    selectedFilter,
    setSelectedFilter,
    pendingCount: ownerMembersQuery.data?.pendingCount ?? 0,
    counts,
    ownerMembers,
    emptyStateType,
    searchQuery,
    handleSearchQueryChange,
    isLoading: isInitialPending,
    isError: isLoadFailed,
    isRetrying: ownerMembersQuery.isFetching,
    handleRetry: () => void ownerMembersQuery.refetch(),
  };
}

export { useOwnerMembersPage };
