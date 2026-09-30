'use client';

import { useMemo } from 'react';

import { useOwnerPetConnectionsQuery, type OwnerPetConnection } from '@entities/owner-pet';
import { getKstDateKey } from '@shared/lib/calendar-date';
import { sortOwnerMemberConnectionHistory } from '@views/owner/member-profile/lib/sortOwnerMemberConnectionHistory';
import type { OwnerMemberConnectionHistoryItem } from '@views/owner/member-profile/model/ownerMemberConnectionHistory';

function toHistoryItem(connection: OwnerPetConnection): OwnerMemberConnectionHistoryItem {
  return {
    id: connection.membershipId,
    connectedAt: getKstDateKey(connection.connectedAt),
    disconnectedAt:
      connection.isCurrent || !connection.disconnectedAt ? null : getKstDateKey(connection.disconnectedAt),
    attendanceDayCount: connection.attendedDays,
  };
}

function useOwnerMemberConnectionHistory(petId: string) {
  const query = useOwnerPetConnectionsQuery({ petId });

  const items = useMemo(
    () => sortOwnerMemberConnectionHistory((query.data ?? []).map(toHistoryItem)),
    [query.data]
  );

  return {
    items,
    isPending: query.isPending,
    isError: query.isError,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}

export { useOwnerMemberConnectionHistory };
