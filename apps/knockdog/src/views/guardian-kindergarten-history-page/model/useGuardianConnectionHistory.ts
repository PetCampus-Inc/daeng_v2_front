'use client';

import { useMemo } from 'react';

import {
  useGuardianSchoolConnectionsQuery,
  type GuardianSchoolConnection,
} from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { formatDateKey } from '@shared/lib/calendar-date';
import { sortGuardianConnectionHistory } from '@views/guardian-kindergarten-history-page/lib/sortGuardianConnectionHistory';
import type { GuardianConnectionHistoryItem } from '@views/guardian-kindergarten-history-page/model/guardianConnectionHistory';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';

function toHistoryItem(connection: GuardianSchoolConnection): GuardianConnectionHistoryItem | null {
  if (!connection.connectedAt) return null;

  return {
    id: connection.id,
    kindergartenId: connection.schoolId,
    name: connection.name,
    address: connection.address,
    imageUrl: connection.imageUrl,
    connectedAt: formatDateKey(connection.connectedAt),
    disconnectedAt: connection.disconnectedAt ? formatDateKey(connection.disconnectedAt) : null,
    attendanceDayCount: connection.attendedDays,
  };
}

function useGuardianConnectionHistory() {
  const userId = useUserStore((state) => state.user?.userId);
  const { selectedPetId, isPetsReady, hasNoPet } = useGuardianSelectedPet();
  const {
    data: connections,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useGuardianSchoolConnectionsQuery({
    userId,
    petId: selectedPetId,
    enabled: isPetsReady && !hasNoPet,
  });

  const items = useMemo(
    () =>
      sortGuardianConnectionHistory(
        (connections ?? [])
          .map(toHistoryItem)
          .filter((item): item is GuardianConnectionHistoryItem => item != null)
      ),
    [connections]
  );

  return {
    items,
    isPending: Boolean(selectedPetId) && !hasNoPet && isPending,
    isError,
    isFetching,
    refetch,
  };
}

export { useGuardianConnectionHistory };
