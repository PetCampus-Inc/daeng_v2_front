import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { GuardianAttendanceDayMock } from '../config/guardianAttendanceMock';
import { MOCK_LINKED_KINDERGARTEN } from '../config/guardianKindergartenMock';
import type {
  GuardianKindergartenConnectionStatus,
  GuardianLinkedKindergarten,
} from './guardianKindergartenConnection';

import { STORAGE_KEYS } from '@shared/constants/storage';

interface GuardianKindergartenMockStore {
  /** API 연동 전 화면 상태 강제용. null이면 pet별 mock/config 기본값 */
  statusOverride: GuardianKindergartenConnectionStatus | null;
  setStatusOverride: (status: GuardianKindergartenConnectionStatus | null) => void;
  /** 등원일 mock 강제. null이면 config MOCK_ATTENDANCE_DAY */
  attendanceOverride: GuardianAttendanceDayMock | null;
  setAttendanceOverride: (attendance: GuardianAttendanceDayMock | null) => void;
  linkedKindergarten: GuardianLinkedKindergarten;
}

/**
 * 스위치로 고른 connection/attendance override는 localStorage에 유지.
 * SHOW_CONNECTION_MOCK_SWITCHER=false여도 마지막 선택 상태가 적용됨.
 * 선택 강아지(selectedPetId)는 useGuardianSelectedPetStore 로 분리.
 */
const useGuardianKindergartenMockStore = create<GuardianKindergartenMockStore>()(
  persist(
    (set) => ({
      statusOverride: null,
      setStatusOverride: (statusOverride) => set({ statusOverride }),
      attendanceOverride: null,
      setAttendanceOverride: (attendanceOverride) => set({ attendanceOverride }),
      linkedKindergarten: MOCK_LINKED_KINDERGARTEN,
    }),
    {
      name: STORAGE_KEYS.GUARDIAN_KINDERGARTEN_MOCK,
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (persisted) => {
        if (!persisted || typeof persisted !== 'object') return persisted as never;
        const state = persisted as {
          statusOverride?: GuardianKindergartenConnectionStatus | null;
          attendanceOverride?: GuardianAttendanceDayMock | null;
        };
        return {
          statusOverride: state.statusOverride ?? null,
          attendanceOverride: state.attendanceOverride ?? null,
        };
      },
      partialize: (state) => ({
        statusOverride: state.statusOverride,
        attendanceOverride: state.attendanceOverride,
      }),
    }
  )
);

export { useGuardianKindergartenMockStore };
