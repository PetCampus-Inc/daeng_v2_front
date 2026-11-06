'use client';

import { create } from 'zustand';
import { SelectedIds } from '@entities/compare/model/compare';

const INITIAL_VALUE = {
  left: null,
  right: null,
};

interface CompareStore {
  selectedIds: SelectedIds;
  toggle: (id: string) => void;
  reset: () => void;
}

const useCompareStore = create<CompareStore>((set) => ({
  selectedIds: INITIAL_VALUE,

  /** 선택 토글 */
  toggle: (id: string) => {
    set((state) => {
      const selectedIds = state.selectedIds;

      // 1. 이미 선택된 경우 -> 제거
      if (selectedIds.left === id) return { selectedIds: { ...selectedIds, left: null } };
      if (selectedIds.right === id) return { selectedIds: { ...selectedIds, right: null } };

      // 2. 2개 다 선택된 경우 -> 무시
      if (selectedIds.left !== null && selectedIds.right !== null) return { selectedIds: { ...selectedIds } };

      // 3. 빈 슬롯에 추가 (왼쪽 우선)
      if (selectedIds.left === null) return { selectedIds: { ...selectedIds, left: id } };
      return { selectedIds: { ...selectedIds, right: id } };
    });
  },

  /** 선택 초기화 */
  reset: () => {
    set({ selectedIds: INITIAL_VALUE });
  },
}));

export { useCompareStore };
