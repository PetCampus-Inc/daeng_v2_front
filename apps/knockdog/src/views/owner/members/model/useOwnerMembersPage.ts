import { useState } from 'react';

import {
  mockOwnerMembers,
  type OwnerMemberSortType,
} from '@views/owner/members/config/ownerMembersContent';

function useOwnerMembersPage() {
  const [sortType, setSortType] = useState<OwnerMemberSortType>('name');
  const ownerMembers = mockOwnerMembers;

  return {
    ownerMembers,
    totalMemberCount: ownerMembers.length,
    sortType,
    setSortType,
  };
}

export { useOwnerMembersPage };
