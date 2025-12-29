import { FloatingActionButton } from '@knockdog/ui';
import { useSearchMachine } from '../model/useSearchMachine';
import { useGeolocationQuery } from '@shared/lib';
import { isNativeWebView } from '@shared/lib/device/isNativeWebView';
import { getCurrentLocation, GetLocationPermissionError } from '@shared/lib/geolocation/getCurrentLocation';
import { useBasePointType } from '@shared/store';

export function CurrentLocationFAB() {
  const { dispatch } = useSearchMachine();
  const { refetch } = useGeolocationQuery(false);
  const { setBaseType } = useBasePointType();

  const handleClick = async () => {
    setBaseType('CURRENT');

    const result = await refetch();
    if (result.data) {
      dispatch({ type: 'BASEPOINT_SYNC', payload: { basePoint: result.data, reason: 'explicit' } });
      return;
    }

    const error = result.error;
    if (isNativeWebView() && error instanceof GetLocationPermissionError) {
      const status = await getCurrentLocation.openPermissionDialog().catch(() => null);
      if (status === 'allowed') {
        const retried = await refetch();
        if (retried.data) {
          dispatch({ type: 'BASEPOINT_SYNC', payload: { basePoint: retried.data, reason: 'explicit' } });
        }
      }
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
