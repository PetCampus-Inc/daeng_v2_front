import { useGeolocationQuery } from './useGeolocationQuery';
import { useBasePointType } from '@shared/store';

export function useBasePoint() {
  const { selectedBaseType } = useBasePointType();

  const current = useGeolocationQuery(selectedBaseType === 'current');
  const home = { data: { lat: 37.5665, lng: 126.978 } }; // 집 (서울시청 임시값)
  const work = { data: { lat: 37.5013, lng: 127.0396 } }; // 직장 (강남역 임시값)

  //   const home = useQuery({
  //     queryKey: globalQueryKeys.basePoint.home(),
  //     queryFn: () => getUserLocation('home'),
  //     enabled: selectedBaseType === 'home',
  //     staleTime: 5 * 60_000,
  //   });
  //   const work = useQuery({
  //     queryKey: globalQueryKeys.basePoint.work(),
  //     queryFn: () => getUserLocation('work'),
  //     enabled: selectedBaseType === 'work',
  //     staleTime: 5 * 60_000,
  //   });

  const coord = selectedBaseType === 'current' ? current.data : selectedBaseType === 'home' ? home.data : work.data;

  return {
    type: selectedBaseType,
    coord,
  };
}
