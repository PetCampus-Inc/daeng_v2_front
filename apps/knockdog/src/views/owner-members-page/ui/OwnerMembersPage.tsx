'use client';

import { MemberCountTab, StatusFilterChip } from '@knockdog/ui';
import { useOwnerMembersPage } from '@views/owner-members-page/model/useOwnerMembersPage';
import { OwnerMembersHero } from '@views/owner-members-page/ui/OwnerMembersHero';
import { OwnerMembersList } from '@views/owner-members-page/ui/OwnerMembersList';
import { OwnerMembersPendingTab } from '@views/owner-members-page/ui/OwnerMembersPendingTab';

import { OWNER_MEMBERS_TAB, type OwnerMembersFilter, type OwnerMembersTab } from '@entities/owner-member';

function OwnerMembersPage() {
  const {
    selectedTab,
    setSelectedTab,
    selectedFilter,
    setSelectedFilter,
    pendingCount,
    counts,
    ownerMembers,
    emptyStateType,
    searchQuery,
    keyword,
    handleSearchQueryChange,
    isLoading,
    isError,
    isRetrying,
    handleRetry,
  } = useOwnerMembersPage();
  const isPendingTab = selectedTab === OWNER_MEMBERS_TAB.pending;
  const filterChips: { filter: OwnerMembersFilter; label: string; count: number }[] = [
    { filter: 'ALL', label: '전체', count: counts.all },
    { filter: 'EXPIRING', label: '만료예정', count: counts.expiring },
    { filter: 'EXPIRED', label: '만료', count: counts.expired },
  ];

  return (
    <div className='bg-bg-0 flex h-dvh flex-col'>
      <OwnerMembersHero searchQuery={searchQuery} onSearchQueryChange={handleSearchQueryChange} />

      <div className='relative flex min-h-0 flex-1 flex-col overflow-hidden'>
        <MemberCountTab
          items={[
            { id: OWNER_MEMBERS_TAB.registered, label: '등록 원생' },
            {
              id: OWNER_MEMBERS_TAB.pending,
              label: '신청',
              count: pendingCount > 0 ? pendingCount : undefined,
            },
          ]}
          value={selectedTab}
          onValueChange={(tab) => setSelectedTab(tab as OwnerMembersTab)}
        />

        {isPendingTab ? (
          <OwnerMembersPendingTab keyword={keyword} />
        ) : (
          <div className='flex min-h-0 w-full flex-1 flex-col'>
            {!isLoading && !isError && counts.all > 0 && (
              <div className='gap-x1 px-x5 py-x3 border-line-100 flex shrink-0 items-center border-b'>
                {filterChips.map(({ filter, label, count }) => (
                  <StatusFilterChip
                    key={filter}
                    selected={selectedFilter === filter}
                    onClick={() => setSelectedFilter(filter)}
                  >
                    {`${label} ${count}`}
                  </StatusFilterChip>
                ))}
              </div>
            )}

            <OwnerMembersList
              members={ownerMembers}
              emptyStateType={emptyStateType}
              isLoading={isLoading}
              isError={isError}
              isRetrying={isRetrying}
              onRetry={handleRetry}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export { OwnerMembersPage };
