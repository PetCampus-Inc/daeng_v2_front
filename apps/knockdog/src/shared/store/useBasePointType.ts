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
 * 같은 세션(앱을 켜둔 동안) 안에서는 선택이 유지되지만, 앱을 완전히 껐다 켜면
 * 다시 "현재 위치(내 주변)"로 초기화되도록 세션스토리지에 저장한다.
 */
export const useBasePointType = create<BasePointTypeState>()(
  persist(
    (set) => ({
      selectedBaseType: 'CURRENT',
      setBaseType: (baseType) => set({ selectedBaseType: baseType }),
    }),
    {
      name: STORAGE_KEYS.BASE_POINT_TYPE,
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
