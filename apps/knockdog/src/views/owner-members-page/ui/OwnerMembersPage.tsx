'use client';

import { MemberCountTab } from '@knockdog/ui';
import { useOwnerMembersPage } from '@views/owner-members-page/model/useOwnerMembersPage';
import { OwnerMembersHero } from '@views/owner-members-page/ui/OwnerMembersHero';
import { OwnerMembersInviteButton } from '@views/owner-members-page/ui/OwnerMembersInviteButton';
import { OwnerMembersPendingTab } from '@views/owner-members-page/ui/OwnerMembersPendingTab';
import { OwnerMembersList } from '@views/owner-members-page/ui/OwnerMembersList';
import { OwnerMembersSummaryBar } from '@views/owner-members-page/ui/OwnerMembersSummaryBar';

import { OWNER_MEMBERS_TAB, type OwnerMembersTab } from '@entities/owner-member';

function OwnerMembersPage() {
  const {
    selectedTab,
    setSelectedTab,
    pendingCount,
    ownerMembers,
    totalMemberCount,
    emptyStateType,
    searchQuery,
    handleSearchQueryChange,
    handleDisconnectMember,
    sortType,
    setSortType,
    isLoading,
    isError,
    isRetrying,
    handleRetry,
  } = useOwnerMembersPage();
  const hasMembers = !isLoading && !isError && totalMemberCount > 0;
  const isPendingTab = selectedTab === OWNER_MEMBERS_TAB.pending;
  const isSearchResult = searchQuery.trim().length > 0;

  return (
    <div
      className='flex h-dvh flex-col'
      style={{
        background:
          'linear-gradient(180deg, var(--color-primitive-orange-400) 0%, var(--color-primitive-orange-500) 42.54%)',
      }}
    >
      <OwnerMembersHero searchQuery={searchQuery} onSearchQueryChange={handleSearchQueryChange} />

      <div className='bg-bg-0 pt-x5 relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[28px]'>
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
          <OwnerMembersPendingTab />
        ) : (
          <div className='flex min-h-0 w-full flex-1 flex-col'>
            {hasMembers && (
              <OwnerMembersSummaryBar
                memberCount={isSearchResult ? ownerMembers.length : totalMemberCount}
                isSearchResult={isSearchResult}
                sortType={sortType}
                onSortTypeChange={setSortType}
              />
            )}

            <OwnerMembersList
              members={ownerMembers}
              emptyStateType={emptyStateType}
              isLoading={isLoading}
              isError={isError}
              isRetrying={isRetrying}
              onRetry={handleRetry}
              onDisconnectMember={handleDisconnectMember}
            />
          </div>
        )}

        <OwnerMembersInviteButton />
      </div>
    </div>
  );
}

export { OwnerMembersPage };
