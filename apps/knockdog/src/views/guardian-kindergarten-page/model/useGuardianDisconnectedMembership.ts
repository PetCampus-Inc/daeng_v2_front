'use client';

import { useMemo } from 'react';

import { useGuardianSchoolConnectionSchoolsQuery } from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { startOfDay } from '@shared/lib/calendar-date';

import { useGuardianSelectedPet } from './useGuardianSelectedPet';

interface UseGuardianDisconnectedMembershipOptions {
  schoolId: string;
}

/** 현재 유치원의 최근 연결 사이클. 학교 단위 목록은 최근 사이클 날짜를 준다. */
function useGuardianDisconnectedMembership({ schoolId }: UseGuardianDisconnectedMembershipOptions) {
  const userId = useUserStore((state) => state.user?.userId);
  const { selectedPetId } = useGuardianSelectedPet();

  const { data: schools } = useGuardianSchoolConnectionSchoolsQuery({
    userId,
    petId: selectedPetId,
    enabled: Boolean(userId) && Boolean(selectedPetId) && Boolean(schoolId),
  });

  const connection = useMemo(
    () => (schools ?? []).find((item) => item.schoolId === schoolId) ?? null,
    [schools, schoolId]
  );

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
