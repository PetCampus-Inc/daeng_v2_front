'use client';

import { useMemo } from 'react';

import { useGuardianSchoolConnectionsQuery } from '@entities/guardian-home';
import { useUserStore } from '@entities/user';

import { toKindergartenSelectOptions, toKindergartenSelectOptionsFromConnections } from './toKindergartenSelectOptions';
import { useGuardianKindergartenHome } from './useGuardianKindergartenHome';

/** 유치원 선택 바텀시트 옵션 — 연결 이력 다건, 없으면 home 현재 연결 1건 */
function useGuardianKindergartenSelectOptions() {
  const userId = useUserStore((state) => state.user?.userId);
  const { linkedKindergarten, status, selectedPet } = useGuardianKindergartenHome();
  const { data: connections } = useGuardianSchoolConnectionsQuery({
    userId,
    petId: selectedPet?.id,
    enabled: Boolean(userId) && Boolean(selectedPet?.id),
  });

  const kindergartens = useMemo(() => {
    const fromConnections = toKindergartenSelectOptionsFromConnections(connections ?? []);
    if (fromConnections.length > 0) return fromConnections;
    return toKindergartenSelectOptions(linkedKindergarten);
  }, [connections, linkedKindergarten]);

  return {
    kindergartens,
    linkedKindergarten,
    status,
  };
}

export { useGuardianKindergartenSelectOptions };
