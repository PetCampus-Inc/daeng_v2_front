import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@shared/constants/storage';
import { createSuppressibleJSONStorage } from '@shared/lib/storage';

const { storage, runWithoutPersisting } = createSuppressibleJSONStorage();

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
      storage,
    }
  )
);

function applySelectedPetId(petId: string | null) {
  useGuardianSelectedPetStore.getState().setSelectedPetId(petId);
}

/** 탭·스택 WebView 간 selectedPetId 동기화
 *
 * 받은 값을 그대로 setSelectedPetId로 재기록하면(zustand persist가 매번
 * localStorage에 재기록) 다른 탭에서 다시 storage 이벤트로 잡혀 서로 반사하는
 * 무한 핑퐁이 될 수 있다(mypageRoleViewStore의 prefersGuardianView에서 실기기로
 * 확인된 것과 동일한 패턴). storage 이벤트로 받은 값을 반영하는 동안은
 * runWithoutPersisting으로 감싸 localStorage 재기록 자체를 막는다.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key !== STORAGE_KEYS.GUARDIAN_SELECTED_PET) return;

    const current = useGuardianSelectedPetStore.getState().selectedPetId;

    if (e.newValue === null) {
      if (current === null) return;
      runWithoutPersisting(() => applySelectedPetId(null));
      return;
    }

    try {
      const parsed = JSON.parse(e.newValue) as { state?: { selectedPetId?: string | null } };
      const nextId = parsed?.state?.selectedPetId;
      if (nextId === undefined) return;
      if ((nextId ?? null) === current) return;
      runWithoutPersisting(() => applySelectedPetId(nextId ?? null));
    } catch (error) {
      console.error('Failed to sync guardian selected pet from storage:', error);
    }
  });

  window.addEventListener('knockdog:guardian-selected-pet', (event: Event) => {
    const petId = (event as CustomEvent<{ petId?: string }>).detail?.petId;
    if (!petId || !/^\d+$/.test(petId)) return;
    applySelectedPetId(petId);
  });
}

export { useGuardianSelectedPetStore };
