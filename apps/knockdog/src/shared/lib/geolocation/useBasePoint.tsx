import { useBasePointType } from '@shared/store';
import { useGeolocationQuery } from './useGeolocationQuery';

export function useBasePoint() {
  const { selectedBaseType } = useBasePointType();

  // selectedBaseType === 'current' 이면 현재 위치 받아오기
  const { data: currentLocation } = useGeolocationQuery(selectedBaseType === 'current');

  const home = { lat: 37.5665, lng: 126.978 }; // 집 (서울시청 임시값)
  const work = { lat: 37.5013, lng: 127.0396 }; // 직장 (강남역 임시값)

  // selectedBaseType === 'home' 이면 집 위치 받아오기 (백엔드 api 이용)
  // selectedBaseType === 'work' 이면 직장 위치 받아오기 (백엔드 api 이용)

  const coord = selectedBaseType === 'current' ? currentLocation : selectedBaseType === 'home' ? home : work;

  return {
    type: selectedBaseType,
    coord,
  };
}
