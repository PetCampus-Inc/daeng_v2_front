import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@shared/constants/storage';

interface GuardianSelectedPetStore {
  /** 유치원 탭에서 보고 있는 강아지. null이면 대표견 */
  selectedPetId: string | null;
  setSelectedPetId: (petId: string | null) => void;
}

/**
 * 선택 강아지 — WebView가 갈려도 localStorage로 유지.
 * mock 스토어와 분리: 프로덕션 상태이므로 스위처/오버라이드와 섞지 않는다.
 */
const useGuardianSelectedPetStore = create<GuardianSelectedPetStore>()(
  persist(
    (set) => ({
      selectedPetId: null,
      setSelectedPetId: (selectedPetId) => set({ selectedPetId }),
    }),
    {
      name: STORAGE_KEYS.GUARDIAN_SELECTED_PET,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/** 탭·스택 WebView 간 selectedPetId 동기화 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key !== STORAGE_KEYS.GUARDIAN_SELECTED_PET) return;

    if (e.newValue === null) {
      useGuardianSelectedPetStore.getState().setSelectedPetId(null);
      return;
    }

    try {
      const parsed = JSON.parse(e.newValue) as { state?: { selectedPetId?: string | null } };
      const nextId = parsed?.state?.selectedPetId;
      if (nextId === undefined) return;
      useGuardianSelectedPetStore.getState().setSelectedPetId(nextId ?? null);
    } catch (error) {
      console.error('Failed to sync guardian selected pet from storage:', error);
    }
  });
}

export { useGuardianSelectedPetStore };
