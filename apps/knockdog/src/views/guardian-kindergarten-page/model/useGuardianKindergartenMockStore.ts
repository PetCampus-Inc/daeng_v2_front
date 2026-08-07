import { create } from 'zustand';

import { MOCK_PENDING_KINDERGARTEN } from '../config/guardianKindergartenMock';
import type {
  GuardianKindergartenConnectionStatus,
  GuardianPendingKindergarten,
} from './guardianKindergartenConnection';

interface GuardianKindergartenMockStore {
  /** API 연동 전 화면 상태 강제용. null이면 기본(none) */
  statusOverride: GuardianKindergartenConnectionStatus | null;
  setStatusOverride: (status: GuardianKindergartenConnectionStatus | null) => void;
  pendingKindergarten: GuardianPendingKindergarten;
}

const useGuardianKindergartenMockStore = create<GuardianKindergartenMockStore>((set) => ({
  statusOverride: null,
  setStatusOverride: (statusOverride) => set({ statusOverride }),
  pendingKindergarten: MOCK_PENDING_KINDERGARTEN,
}));

export { useGuardianKindergartenMockStore };
