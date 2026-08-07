import { create } from 'zustand';

import { MOCK_LINKED_KINDERGARTEN } from '../config/guardianKindergartenMock';
import type {
  GuardianKindergartenConnectionStatus,
  GuardianLinkedKindergarten,
} from './guardianKindergartenConnection';

interface GuardianKindergartenMockStore {
  /** API 연동 전 화면 상태 강제용. null이면 pet별 mock/config 기본값 */
  statusOverride: GuardianKindergartenConnectionStatus | null;
  setStatusOverride: (status: GuardianKindergartenConnectionStatus | null) => void;
  linkedKindergarten: GuardianLinkedKindergarten;
  /** 유치원 탭에서 보고 있는 강아지. null이면 대표견 */
  selectedPetId: string | null;
  setSelectedPetId: (petId: string | null) => void;
}

const useGuardianKindergartenMockStore = create<GuardianKindergartenMockStore>((set) => ({
  statusOverride: null,
  setStatusOverride: (statusOverride) => set({ statusOverride }),
  linkedKindergarten: MOCK_LINKED_KINDERGARTEN,
  selectedPetId: null,
  setSelectedPetId: (selectedPetId) => set({ selectedPetId }),
}));

export { useGuardianKindergartenMockStore };
