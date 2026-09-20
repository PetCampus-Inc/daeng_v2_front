'use client';

import { useMemo } from 'react';

import { MOCK_OWNER_MEMBER_CONNECTION_HISTORY } from '@views/owner/member-profile/config/ownerMemberConnectionHistoryMock';
import { sortOwnerMemberConnectionHistory } from '@views/owner/member-profile/lib/sortOwnerMemberConnectionHistory';

/** 원장용 연결 이력 API 없음 — mock만 반환 */
function useOwnerMemberConnectionHistory() {
  const items = useMemo(
    () => sortOwnerMemberConnectionHistory(MOCK_OWNER_MEMBER_CONNECTION_HISTORY),
    []
  );

  return { items };
}

export { useOwnerMemberConnectionHistory };
