import { FloatingActionButton } from '@knockdog/ui';
import { useMapUrlState } from '../model/useMapUrlState';
import { useGeolocationQuery } from '@shared/lib';

export function CurrentLocationFAB() {
  const { setCenter } = useMapUrlState();
  const { refetch } = useGeolocationQuery(false);

  const handleClick = async () => {
    const { data: coords } = await refetch();
    if (!coords) return;
    setCenter(coords);
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
