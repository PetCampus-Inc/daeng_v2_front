import { useGuardianSelectedPet } from './useGuardianSelectedPet';
import { useGuardianKindergartenMockStore } from './useGuardianKindergartenMockStore';
import type { GuardianKindergartenConnectionStatus } from './guardianKindergartenConnection';

/**
 * 선택견–유치원 연결 상태.
 * - statusOverride가 있으면 최우선 (스위치 UI 숨겨도 localStorage 값 유지)
 * - 없으면 선택견별 mock (BY_NAME → 대표견은 MOCK_CONNECTION_STATUS, 그 외 none)
 * - disconnected여도 마지막 연결 유치원 정보는 유지
 */
function useGuardianKindergartenConnection() {
  const statusOverride = useGuardianKindergartenMockStore((state) => state.statusOverride);
  const storeKindergarten = useGuardianKindergartenMockStore((state) => state.linkedKindergarten);
  const { selectedPet, getPetConnectionStatus } = useGuardianSelectedPet();

  const petStatus: GuardianKindergartenConnectionStatus = selectedPet
    ? (getPetConnectionStatus(selectedPet) ?? 'none')
    : 'none';

  const status: GuardianKindergartenConnectionStatus = statusOverride ?? petStatus;

  const hasActiveLink = status === 'pending' || status === 'approved';
  const showLastKindergarten = hasActiveLink || status === 'disconnected';

  return {
    status,
    linkedKindergarten: showLastKindergarten ? storeKindergarten : null,
    selectedPet,
  };
}

export { useGuardianKindergartenConnection };
