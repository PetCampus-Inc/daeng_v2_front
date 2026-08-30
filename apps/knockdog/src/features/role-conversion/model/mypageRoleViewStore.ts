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

declare global {
  interface Window {
    /** 네이티브(푸시 딥링크 등)가 강제로 특정 탭으로 이동시킬 때 뷰 선호도를 맞추기 위해 호출 */
    __knockdogSetPrefersGuardianView?: (value: boolean) => void;
  }
}

/** 네이티브가 원장/보호자 전용 탭으로 강제 이동시킬 때, 이후 다른 탭으로 넘어가도
 * 모드가 되돌아가지 않도록 뷰 선호도를 같이 맞춘다. */
if (typeof window !== 'undefined') {
  window.__knockdogSetPrefersGuardianView = (value: boolean) => {
    useMypageRoleViewStore.getState().setPrefersGuardianView(value);
  };
}

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
