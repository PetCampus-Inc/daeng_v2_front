'use client';

import { useOwnerMembersPage } from '@views/owner/members/model/useOwnerMembersPage';
import { OwnerMembersHero } from '@views/owner/members/ui/OwnerMembersHero';
import { OwnerMembersInviteButton } from '@views/owner/members/ui/OwnerMembersInviteButton';
import { OwnerMembersList } from '@views/owner/members/ui/OwnerMembersList';
import { OwnerMembersSummaryBar } from '@views/owner/members/ui/OwnerMembersSummaryBar';

function OwnerMembersPage() {
  const {
    ownerMembers,
    totalMemberCount,
    searchQuery,
    handleSearchQueryChange,
    handleDisconnectMember,
    sortType,
    setSortType,
  } = useOwnerMembersPage();

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
          <OwnerMembersSummaryBar
            totalMemberCount={totalMemberCount}
            sortType={sortType}
            onSortTypeChange={setSortType}
          />

          <OwnerMembersList members={ownerMembers} onDisconnectMember={handleDisconnectMember} />
        </div>

        <OwnerMembersInviteButton />
      </div>
    </div>
  );
}

export { OwnerMembersPage };
