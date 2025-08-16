import { create } from 'zustand';

type BasePointType = 'current' | 'home' | 'work';

interface BasePointTypeState {
  /** 현재 선택된 기준 타입 */
  selectedBaseType: BasePointType;
  /** 기준 타입 변경 */
  setBaseType: (baseType: BasePointType) => void;
}

/**
 * 기준점 타입(현재위치, 집, 직장)을 관리하는 스토어
 *
 * @description
 * 기준 타입을 관리합니다.
 */
export const useBasePointType = create<BasePointTypeState>((set) => ({
  selectedBaseType: 'current',

  setBaseType: (baseType) => set({ selectedBaseType: baseType }),
}));
