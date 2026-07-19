'use client';

import { useOwnerMembersPage } from '@views/owner-members-page/model/useOwnerMembersPage';
import { OwnerMembersHero } from '@views/owner-members-page/ui/OwnerMembersHero';
import { OwnerMembersInviteButton } from '@views/owner-members-page/ui/OwnerMembersInviteButton';
import { OwnerMembersList } from '@views/owner-members-page/ui/OwnerMembersList';
import { OwnerMembersSummaryBar } from '@views/owner-members-page/ui/OwnerMembersSummaryBar';

function OwnerMembersPage() {
  const {
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
  } = useOwnerMembersPage();
  const hasMembers = !isLoading && !isError && totalMemberCount > 0;
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
            onDisconnectMember={handleDisconnectMember}
          />
        </div>

        <OwnerMembersInviteButton />
      </div>
    </div>
  );
}

export { OwnerMembersPage };
