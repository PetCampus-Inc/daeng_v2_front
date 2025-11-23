import { FloatingActionButton } from '@knockdog/ui';
// FIXME: fsd import 위반. 추후 수정예정
import { useMapState } from '@views/kindergarten-main-page/model/useMapState';
import { getCurrentLocation } from '@shared/lib';

export function CurrentLocationFAB() {
  const { setCenter } = useMapState();

  const handleClick = async () => {
    const { coords } = await getCurrentLocation();
    setCenter({ lat: coords.latitude, lng: coords.longitude });
  };

  return (
    <FloatingActionButton
      icon='Location'
      label='현재 위치'
      variant='neutralLight'
      size='medium'
      onClick={handleClick}
      extended={false}
    />
  );
}
