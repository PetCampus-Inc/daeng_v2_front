import { create } from 'zustand';

interface MarkerState {
  activeMarkerId: string | null;
  setActiveMarker: (id: string | null) => void;
}

/**
 * 현재 선택된 마커 ID를 관리하는 스토어
 *
 * @description
 * 마커 클릭 시 마커 ID를 설정하고, 바텀시트 닫을 때 마커 ID를 초기화합니다.
 */
export const useMarkerState = create<MarkerState>((set) => ({
  activeMarkerId: null,
  setActiveMarker: (id) => set({ activeMarkerId: id }),
}));
