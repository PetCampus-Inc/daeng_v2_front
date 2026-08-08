import { SHOW_CONNECTION_MOCK_SWITCHER } from '../config/guardianKindergartenMock';
import { useGuardianSelectedPet } from './useGuardianSelectedPet';
import { useGuardianKindergartenMockStore } from './useGuardianKindergartenMockStore';
import type { GuardianKindergartenConnectionStatus } from './guardianKindergartenConnection';

/**
 * 선택견–유치원 연결 상태.
 * 기본: 선택견별 mock. 스위치 UI가 켜져 있을 때만 statusOverride로 우선 적용
 */
function useGuardianKindergartenConnection() {
  const statusOverride = useGuardianKindergartenMockStore((state) => state.statusOverride);
  const linkedKindergarten = useGuardianKindergartenMockStore((state) => state.linkedKindergarten);
  const { selectedPet, getPetConnectionStatus } = useGuardianSelectedPet();

  const petStatus: GuardianKindergartenConnectionStatus = selectedPet
    ? getPetConnectionStatus(selectedPet)
    : 'none';

  const status: GuardianKindergartenConnectionStatus =
    SHOW_CONNECTION_MOCK_SWITCHER && statusOverride != null ? statusOverride : petStatus;
  const hasLinkedKindergarten = status === 'pending' || status === 'approved';

  return {
    status,
    linkedKindergarten: hasLinkedKindergarten ? linkedKindergarten : null,
    selectedPet,
  };
}

export { useGuardianKindergartenConnection };
