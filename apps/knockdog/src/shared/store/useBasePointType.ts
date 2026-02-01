import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { STORAGE_KEYS } from '@shared/constants/storage';

export type BasePointType = 'CURRENT' | 'HOME' | 'WORK';

interface BasePointTypeState {
  /** 현재 선택된 기준 타입 */
  selectedBaseType: BasePointType;
  /** 기준 타입 변경 */
  setBaseType: (baseType: BasePointType) => void;
}

/**
 * 기준점 타입(현재위치, 집, 직장)을 관리하는 스토어
 *
 */
export const useBasePointType = create<BasePointTypeState>()(
  persist(
    (set) => ({
      selectedBaseType: 'CURRENT',
      setBaseType: (baseType) => set({ selectedBaseType: baseType }),
    }),
    {
      name: STORAGE_KEYS.BASE_POINT_TYPE,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
