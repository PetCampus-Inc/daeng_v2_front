import { create } from 'zustand';

interface BottomTabBarVisibilityStore {
  visible: boolean;
  dimmed: boolean;
  setVisible: (visible: boolean) => void;
  setDimmed: (dimmed: boolean) => void;
}

const useBottomTabBarVisibilityStore = create<BottomTabBarVisibilityStore>((set) => ({
  visible: true,
  dimmed: false,
  setVisible: (visible) => set({ visible }),
  setDimmed: (dimmed) => set({ dimmed }),
}));

export { useBottomTabBarVisibilityStore };
