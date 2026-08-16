'use client';

import { useMemo } from 'react';

import { toKindergartenSelectOptions } from './toKindergartenSelectOptions';
import { useGuardianKindergartenHome } from './useGuardianKindergartenHome';

/**
 * 유치원 선택 바텀시트 옵션 — home 현재 연결 1건.
 * 연결 이력 API 연동 시 매퍼만 확장하면 된다.
 */
function useGuardianKindergartenSelectOptions() {
  const { linkedKindergarten, status } = useGuardianKindergartenHome();

  const kindergartens = useMemo(
    () => toKindergartenSelectOptions(linkedKindergarten),
    [linkedKindergarten]
  );

  return {
    kindergartens,
    linkedKindergarten,
    status,
  };
}

export { useGuardianKindergartenSelectOptions };
