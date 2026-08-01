import { create } from 'zustand';

type MainTabMode = 'guardian' | 'owner';

interface MainTabModeState {
  mode: MainTabMode;
  setMode: (mode: MainTabMode) => void;
}

const useMainTabModeStore = create<MainTabModeState>((set) => ({
  mode: 'guardian',
  setMode: (mode) => set({ mode }),
}));

export { useMainTabModeStore };
export type { MainTabMode };
