import { create } from 'zustand';

interface SearchListScrollState {
  scrollTop: number;
  setScrollTop: (value: number) => void;
}

export const useSearchListScroll = create<SearchListScrollState>((set) => ({
  scrollTop: 0,
  setScrollTop: (value) => set({ scrollTop: value }),
}));
