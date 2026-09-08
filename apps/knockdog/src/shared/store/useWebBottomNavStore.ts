import { create } from 'zustand';

interface WebBottomNavStore {
  isFilterBottomSheetOpen: boolean;
  setFilterBottomSheetOpen: (isOpen: boolean) => void;
}

const useWebBottomNavStore = create<WebBottomNavStore>((set) => ({
  isFilterBottomSheetOpen: false,
  setFilterBottomSheetOpen: (isOpen) => set({ isFilterBottomSheetOpen: isOpen }),
}));

export { useWebBottomNavStore };
