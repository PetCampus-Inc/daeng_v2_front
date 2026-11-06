import { useGuardianSelectedPet } from './useGuardianSelectedPet';
import { useGuardianKindergartenMockStore } from './useGuardianKindergartenMockStore';
import type { GuardianKindergartenConnectionStatus } from './guardianKindergartenConnection';

/**
 * 선택견–유치원 연결 상태 (mock override 전용).
 * 실제 홈 상태는 `useGuardianKindergartenHome` / home API를 사용.
 */
function useGuardianKindergartenConnection() {
  const statusOverride = useGuardianKindergartenMockStore((state) => state.statusOverride);
  const storeKindergarten = useGuardianKindergartenMockStore((state) => state.linkedKindergarten);
  const { selectedPet } = useGuardianSelectedPet();

  const status: GuardianKindergartenConnectionStatus = statusOverride ?? 'none';

  const hasActiveLink = status === 'pending' || status === 'approved';
  const showLastKindergarten = hasActiveLink || status === 'disconnected';

  return {
    status,
    linkedKindergarten: showLastKindergarten ? storeKindergarten : null,
    selectedPet,
  };
}

export { useGuardianKindergartenConnection };
