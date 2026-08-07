import { MOCK_CONNECTION_STATUS } from '../config/guardianKindergartenMock';
import { useGuardianKindergartenMockStore } from './useGuardianKindergartenMockStore';
import type { GuardianKindergartenConnectionStatus } from './guardianKindergartenConnection';

/**
 * 대표견–유치원 연결 상태.
 * API 연동 전: config MOCK_CONNECTION_STATUS (+ 선택적 UI override)
 */
function useGuardianKindergartenConnection() {
  const statusOverride = useGuardianKindergartenMockStore((state) => state.statusOverride);
  const linkedKindergarten = useGuardianKindergartenMockStore((state) => state.linkedKindergarten);

  const status: GuardianKindergartenConnectionStatus = statusOverride ?? MOCK_CONNECTION_STATUS;
  const hasLinkedKindergarten = status === 'pending' || status === 'approved';

  return {
    status,
    linkedKindergarten: hasLinkedKindergarten ? linkedKindergarten : null,
  };
}

export { useGuardianKindergartenConnection };
