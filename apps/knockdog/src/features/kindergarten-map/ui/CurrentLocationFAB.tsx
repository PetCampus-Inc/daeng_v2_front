import { FloatingActionButton } from '@knockdog/ui';
import { useSearchMachine } from '../model/useSearchMachine';
import { useGeolocationQuery } from '@shared/lib';
import { useBasePointType } from '@shared/store';

export function CurrentLocationFAB() {
  const { dispatch } = useSearchMachine();
  const { refetch } = useGeolocationQuery({ enabled: false });
  const { setBaseType } = useBasePointType();

  const handleClick = async () => {
    setBaseType('CURRENT');

    const result = await refetch();
    if (result.data) {
      dispatch({ type: 'BASEPOINT_SYNC', payload: { basePoint: result.data, reason: 'explicit' } });
    }
  };

  return (
    <FloatingActionButton
      icon='LocationFill'
      label='현재 위치'
      variant='neutralLight'
      size='medium'
      onClick={handleClick}
      extended={false}
    />
  );
}
