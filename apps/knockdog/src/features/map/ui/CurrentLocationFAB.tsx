import { FloatingActionButton } from '@knockdog/ui';
// FIXME: fsd import 위반. 추후 수정예정
import { useMapState } from '@views/kindergarten-main-page/model/useMapState';
import { useGeolocationQuery } from '@shared/lib';

export function CurrentLocationFAB() {
  const { data: currentLocation } = useGeolocationQuery();
  const { setCenter } = useMapState();

  const handleCurrentLocationClick = () => {
    if (currentLocation) {
      setCenter({ lat: currentLocation.lat, lng: currentLocation.lng });
    }
  };

  return (
    <FloatingActionButton
      icon='Location'
      label='현재 위치'
      variant='neutralLight'
      size='medium'
      onClick={handleCurrentLocationClick}
      disabled={!currentLocation}
      extended={false}
    />
  );
}
