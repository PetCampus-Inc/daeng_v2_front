'use client';

import { useMemo } from 'react';

import { useGuardianSchoolConnectionsQuery } from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { startOfDay } from '@shared/lib/calendar-date';

import { useGuardianSelectedPet } from './useGuardianSelectedPet';

interface UseGuardianDisconnectedMembershipOptions {
  schoolId: string;
}

/** 현재 유치원의 최근 연결 해제 membership */
function useGuardianDisconnectedMembership({ schoolId }: UseGuardianDisconnectedMembershipOptions) {
  const userId = useUserStore((state) => state.user?.userId);
  const { selectedPetId } = useGuardianSelectedPet();

  const { data: connections } = useGuardianSchoolConnectionsQuery({
    userId,
    petId: selectedPetId,
    enabled: Boolean(userId) && Boolean(selectedPetId),
  });

  const connection = useMemo(() => {
    const candidates = (connections ?? [])
      .filter((item) => item.schoolId === schoolId && item.disconnectedAt != null)
      .sort((left, right) => right.disconnectedAt!.getTime() - left.disconnectedAt!.getTime());

    return candidates[0] ?? null;
  }, [connections, schoolId]);

  const disconnectedAtMs = connection?.disconnectedAt?.getTime() ?? null;
  const connectedAtMs = connection?.connectedAt?.getTime() ?? null;

  const disconnectedAt = useMemo(
    () => (disconnectedAtMs != null ? startOfDay(new Date(disconnectedAtMs)) : null),
    [disconnectedAtMs]
  );
  const connectedAt = useMemo(
    () => (connectedAtMs != null ? startOfDay(new Date(connectedAtMs)) : null),
    [connectedAtMs]
  );

  return {
    disconnectedAt,
    connectedAt,
  };
}

export { useGuardianDisconnectedMembership };
