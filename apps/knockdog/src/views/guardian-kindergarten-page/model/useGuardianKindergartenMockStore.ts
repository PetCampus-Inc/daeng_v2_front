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
  /** 유치원 탭에서 보고 있는 강아지. null이면 대표견 */
  selectedPetId: string | null;
  setSelectedPetId: (petId: string | null) => void;
}

/**
 * 등원 mock override만 localStorage 유지.
 * 연결 statusOverride는 선택견 전환 시 초기화(견별 mock이 우선).
 */
const useGuardianKindergartenMockStore = create<GuardianKindergartenMockStore>()(
  persist(
    (set) => ({
      statusOverride: null,
      setStatusOverride: (statusOverride) => set({ statusOverride }),
      attendanceOverride: null,
      setAttendanceOverride: (attendanceOverride) => set({ attendanceOverride }),
      linkedKindergarten: MOCK_LINKED_KINDERGARTEN,
      selectedPetId: null,
      setSelectedPetId: (selectedPetId) =>
        set({ selectedPetId, statusOverride: null }),
    }),
    {
      name: STORAGE_KEYS.GUARDIAN_KINDERGARTEN_MOCK,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persisted) => {
        if (!persisted || typeof persisted !== 'object') return persisted as never;
        const state = persisted as { attendanceOverride?: GuardianAttendanceDayMock | null };
        return {
          attendanceOverride: state.attendanceOverride ?? null,
        };
      },
      partialize: (state) => ({
        attendanceOverride: state.attendanceOverride,
      }),
    }
  )
);

export { useGuardianKindergartenMockStore };
