import { FloatingActionButton } from '@knockdog/ui';
import { useGeolocationQuery } from '@shared/lib';
import { useSearchMachine } from '../model/useSearchMachine';

export function CurrentLocationFAB() {
  const { dispatch } = useSearchMachine();
  const { refetch } = useGeolocationQuery(false);

  const handleClick = async () => {
    const { data: coords } = await refetch();
    if (!coords) return;
    dispatch({ type: 'REFPOINT_SET', refPoint: coords });
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
