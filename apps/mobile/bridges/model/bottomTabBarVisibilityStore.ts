import { create } from 'zustand';

interface BottomTabBarVisibilityStore {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const useBottomTabBarVisibilityStore = create<BottomTabBarVisibilityStore>((set) => ({
  visible: true,
  setVisible: (visible) => set({ visible }),
}));

export { useBottomTabBarVisibilityStore };
