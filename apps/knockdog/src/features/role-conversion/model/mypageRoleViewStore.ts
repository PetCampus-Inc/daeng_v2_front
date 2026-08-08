import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@shared/constants/storage';

interface MypageRoleViewStore {
  prefersGuardianView: boolean;
  setPrefersGuardianView: (value: boolean) => void;
  togglePrefersGuardianView: () => void;
  resetPrefersGuardianView: () => void;
}

const useMypageRoleViewStore = create<MypageRoleViewStore>()(
  persist(
    (set) => ({
      prefersGuardianView: false,
      setPrefersGuardianView: (value) => set({ prefersGuardianView: value }),
      togglePrefersGuardianView: () => set((state) => ({ prefersGuardianView: !state.prefersGuardianView })),
      resetPrefersGuardianView: () => set({ prefersGuardianView: false }),
    }),
    {
      name: STORAGE_KEYS.MYPAGE_ROLE_VIEW,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/** 탭 WebView 간 prefersGuardianView 동기화 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key !== STORAGE_KEYS.MYPAGE_ROLE_VIEW) return;

    if (e.newValue === null) {
      useMypageRoleViewStore.getState().resetPrefersGuardianView();
      return;
    }

    try {
      const parsed = JSON.parse(e.newValue) as { state?: { prefersGuardianView?: boolean } };
      if (typeof parsed?.state?.prefersGuardianView === 'boolean') {
        useMypageRoleViewStore.getState().setPrefersGuardianView(parsed.state.prefersGuardianView);
      }
    } catch (error) {
      console.error('Failed to sync mypage role view from storage:', error);
    }
  });
}

export { useMypageRoleViewStore };
