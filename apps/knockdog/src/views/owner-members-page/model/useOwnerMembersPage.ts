import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { OWNER_MEMBER_SEARCH_MAX_LENGTH } from '@views/owner-members-page/config/ownerMembersContent';
import type { OwnerMembersEmptyStateType } from '@views/owner-members-page/config/ownerMembersEmptyContent';
import { hasListLoadFailed } from '@views/owner-members-page/lib/hasListLoadFailed';
import { useOwnerRole } from '@features/role-conversion';

import { toast } from '@shared/ui/toast';

import {
  OWNER_MEMBERS_TAB,
  OWNER_MEMBERS_TAB_QUERY_KEY,
  useOwnerMembersQuery,
  type OwnerMembersFilter,
  type OwnerMembersTab,
} from '@entities/owner-member';
import { useUserStore } from '@entities/user';

const SEARCH_ALLOWED_PATTERN = /[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z ]/g;
/** 한글을 치는 도중에 남는, 자음·모음만 있는 글자. 백엔드는 이런 검색어에 400 오류를 준다 */
const INCOMPLETE_HANGUL_PATTERN = /[ㄱ-ㅎㅏ-ㅣ]/;

/** 주소의 `tab` 값으로 처음 열 탭을 정한다. 알 수 없는 값은 등록 원생 탭 */
function resolveInitialTab(value: string | null): OwnerMembersTab {
  return value === OWNER_MEMBERS_TAB.pending ? OWNER_MEMBERS_TAB.pending : OWNER_MEMBERS_TAB.registered;
}

/** 주소의 `filter` 값으로 처음 고를 칩을 정한다. 알림에서는 `expiring`으로 들어온다 */
function resolveInitialFilter(value: string | null): OwnerMembersFilter {
  if (value?.toLowerCase() === 'expiring') return 'EXPIRING';
  if (value?.toLowerCase() === 'expired') return 'EXPIRED';

  return 'ALL';
}

function useOwnerMembersPage() {
  const searchParams = useSearchParams();
  const [selectedTab, setSelectedTab] = useState<OwnerMembersTab>(() =>
    resolveInitialTab(searchParams.get(OWNER_MEMBERS_TAB_QUERY_KEY))
  );
  const [selectedFilter, setSelectedFilter] = useState<OwnerMembersFilter>(() =>
    resolveInitialFilter(searchParams.get('filter'))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const userId = useUserStore((state) => state.user?.userId);
  const { isOwner, isResolved } = useOwnerRole();
  /** 서버에 보내는 검색어. 입력 중인 글자가 덜 만들어졌을 땐 바뀌지 않는다 */
  const [keyword, setKeyword] = useState('');
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

  /** 입력값에서 한글·영문·공백 외 글자를 지우고, 지웠으면 안내 토스트를 보여준다 */
  const handleSearchQueryChange = (value: string) => {
    const allowedValue = value.replace(SEARCH_ALLOWED_PATTERN, '');
    if (allowedValue.length !== value.length) toast({ title: '한글과 영문만 입력할 수 있어요' });

    const nextQuery = allowedValue.slice(0, OWNER_MEMBER_SEARCH_MAX_LENGTH);
    setSearchQuery(nextQuery);
    if (!INCOMPLETE_HANGUL_PATTERN.test(nextQuery)) setKeyword(nextQuery.trim());
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
    keyword,
    handleSearchQueryChange,
    isLoading: isInitialPending,
    isError: isLoadFailed,
    isRetrying: ownerMembersQuery.isFetching,
    handleRetry: () => void ownerMembersQuery.refetch(),
  };
}

export { useOwnerMembersPage };
