import { create } from 'zustand';
import type { ToastOptions } from '@/types/toast';

export type ToastItem = Required<Pick<ToastOptions, 'title' | 'description' | 'duration' | 'shape'>> & {
  id: string;
  type?: 'default' | 'success';
  open: boolean;
  onOpen?: () => void;
  onClose?: () => void;
};

type ToastState = {
  items: ToastItem[];
  push: (item: ToastItem) => void;
  dismiss: (id?: string) => void;
  clear: () => void;
};

export function createToastStore() {
  return create<ToastState>((set, get) => ({
    items: [],
    push: (item) => {
      set((s) => ({ items: [...s.items.filter((i) => i.id !== item.id), item] }));
      item.onOpen?.();
    },
    dismiss: (id) => {
      const items = get().items;
      if (!items.length) return;
      const targetId = id ?? items[items.length - 1]?.id;
      if (!targetId) return;
      set((s) => ({
        items: s.items.filter((it) => {
          if (it.id === targetId) {
            it.onClose?.();
            return false;
          }
          return true;
        }),
      }));
    },
    clear: () => {
      const items = get().items;
      items.forEach((it) => it.onClose?.());
      set({ items: [] });
    },
  }));
}
