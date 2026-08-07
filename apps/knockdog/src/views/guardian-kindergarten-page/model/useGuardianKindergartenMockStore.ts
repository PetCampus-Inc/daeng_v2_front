import { create } from 'zustand';

import { MOCK_LINKED_KINDERGARTEN } from '../config/guardianKindergartenMock';
import type {
  GuardianKindergartenConnectionStatus,
  GuardianLinkedKindergarten,
} from './guardianKindergartenConnection';

interface GuardianKindergartenMockStore {
  /** API 연동 전 화면 상태 강제용. null이면 config 기본값 */
  statusOverride: GuardianKindergartenConnectionStatus | null;
  setStatusOverride: (status: GuardianKindergartenConnectionStatus | null) => void;
  linkedKindergarten: GuardianLinkedKindergarten;
}

const useGuardianKindergartenMockStore = create<GuardianKindergartenMockStore>((set) => ({
  statusOverride: null,
  setStatusOverride: (statusOverride) => set({ statusOverride }),
  linkedKindergarten: MOCK_LINKED_KINDERGARTEN,
}));

export { useGuardianKindergartenMockStore };
