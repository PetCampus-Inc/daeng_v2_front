import { createStore as createZustandStore } from 'zustand/vanilla';
import type { ToastItem } from './types';

export interface ToastStoreState {
  items: ToastItem[];
  push: (item: ToastItem) => void;
  dismiss: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export function createStore() {
  return createZustandStore<ToastStoreState>((set, get) => ({
    items: [],

    push: (item) => {
      set((state) => ({ items: [...state.items, item] }));
      item.onOpen?.();
    },

    // 애니메이션을 위해 open을 false로 변경
    dismiss: (id) => {
      const items = get().items;
      const target = items.find((item) => item.id === id);
      if (target) {
        target.onClose?.();
      }
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? { ...item, open: false } : item)),
      }));
    },

    // 실제로 items에서 제거
    remove: (id) => {
      set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    },

    clear: () => {
      const items = get().items;
      items.forEach((item) => item.onClose?.());
      set({ items: [] });
    },
  }));
}

export type ToastStore = ReturnType<typeof createStore>;
