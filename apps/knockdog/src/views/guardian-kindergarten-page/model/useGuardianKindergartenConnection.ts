import { useGuardianSelectedPet } from './useGuardianSelectedPet';
import { useGuardianKindergartenMockStore } from './useGuardianKindergartenMockStore';
import type { GuardianKindergartenConnectionStatus } from './guardianKindergartenConnection';

/**
 * 선택견–유치원 연결 상태.
 * API 연동 전: pet별 mock + config (+ 선택적 UI override)
 */
function useGuardianKindergartenConnection() {
  const statusOverride = useGuardianKindergartenMockStore((state) => state.statusOverride);
  const linkedKindergarten = useGuardianKindergartenMockStore((state) => state.linkedKindergarten);
  const { selectedPet, getPetConnectionStatus } = useGuardianSelectedPet();

  const petStatus: GuardianKindergartenConnectionStatus = selectedPet
    ? getPetConnectionStatus(selectedPet)
    : 'none';

  const status: GuardianKindergartenConnectionStatus = statusOverride ?? petStatus;
  const hasLinkedKindergarten = status === 'pending' || status === 'approved';

  return {
    status,
    linkedKindergarten: hasLinkedKindergarten ? linkedKindergarten : null,
    selectedPet,
  };
}

export { useGuardianKindergartenConnection };
