'use client';
import { create } from 'zustand';

export type CompareItem = {
  id: string;
  title: string;
  thumb?: string;
  /** 서브텍스트(예: "유치원 ・ 호텔") */
  ctgText?: string;
};

type CompareStore = {
  items: CompareItem[];
  add: (item: CompareItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  toggle: (item: CompareItem) => void;
};

export const useCompareStore = create<CompareStore>((set, get) => ({
  items: [],

  add: (item) => {
    const list = get().items.filter((x) => x.id !== item.id);
    // 새 항목을 앞으로, 최대 2개 유지
    set({ items: [item, ...list].slice(0, 2) });
  },

  remove: (id) => set({ items: get().items.filter((x) => x.id !== id) }),

  clear: () => set({ items: [] }),

  isSelected: (id) => get().items.some((x) => x.id === id),

  toggle: (item) => {
    const { isSelected, remove, add } = get();
    if (isSelected(item.id)) remove(item.id);
    else add(item);
  },
}));
