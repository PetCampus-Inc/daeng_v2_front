'use client';

import { useMemo, useState } from 'react';

import { useGuardianSchoolConnectionsQuery, type GuardianSchoolConnection } from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { formatDateKey } from '@shared/lib/calendar-date';
import { sortGuardianConnectionHistory } from '@views/guardian-kindergarten-history-page/lib/sortGuardianConnectionHistory';
import type { GuardianConnectionHistoryItem } from '@views/guardian-kindergarten-history-page/model/guardianConnectionHistory';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';

function toHistoryItem(connection: GuardianSchoolConnection): GuardianConnectionHistoryItem | null {
  if (!connection.connectedAt) return null;

  return {
    id: connection.id,
    schoolPetMembershipId: connection.schoolPetMembershipId,
    kindergartenId: connection.placeId ?? connection.schoolId,
    placeId: connection.placeId,
    name: connection.name,
    address: connection.address,
    imageUrl: connection.imageUrl,
    connectedAt: formatDateKey(connection.connectedAt),
    disconnectedAt: connection.disconnectedAt ? formatDateKey(connection.disconnectedAt) : null,
    attendanceDayCount: connection.attendedDays,
    canWriteReview: connection.canWriteReview,
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

  /** 해제 성공 직후 목록을 다시 불러오기 전에 해당 연결을 이전 이력으로 보여 주기 위한 해제일 */
  const [localDisconnectedAtById, setLocalDisconnectedAtById] = useState<Record<string, string>>({});

  const items = useMemo(
    () =>
      sortGuardianConnectionHistory(
        (connections ?? [])
          .map(toHistoryItem)
          .filter((item): item is GuardianConnectionHistoryItem => item != null)
          .map((item) => ({ ...item, disconnectedAt: localDisconnectedAtById[item.id] ?? item.disconnectedAt }))
      ),
    [connections, localDisconnectedAtById]
  );

  /** 연결 하나를 해제된 것으로 표시한다 */
  const markDisconnected = (id: string, disconnectedAt: string) =>
    setLocalDisconnectedAtById((previous) => ({ ...previous, [id]: disconnectedAt }));

  return {
    items,
    isPending: Boolean(selectedPetId) && !hasNoPet && isPending,
    isError,
    isFetching,
    refetch,
    markDisconnected,
  };
}

export { useGuardianConnectionHistory };
