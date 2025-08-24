import { FloatingActionButton } from '@knockdog/ui';
import { useMapState } from '@widgets/map-with-schools/model/useMapState';
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
