import { create } from 'zustand';

interface MypageRoleViewStore {
  prefersGuardianView: boolean;
  setPrefersGuardianView: (value: boolean) => void;
  togglePrefersGuardianView: () => void;
  resetPrefersGuardianView: () => void;
}

const useMypageRoleViewStore = create<MypageRoleViewStore>((set) => ({
  prefersGuardianView: false,
  setPrefersGuardianView: (value) => set({ prefersGuardianView: value }),
  togglePrefersGuardianView: () => set((state) => ({ prefersGuardianView: !state.prefersGuardianView })),
  resetPrefersGuardianView: () => set({ prefersGuardianView: false }),
}));

export { useMypageRoleViewStore };
