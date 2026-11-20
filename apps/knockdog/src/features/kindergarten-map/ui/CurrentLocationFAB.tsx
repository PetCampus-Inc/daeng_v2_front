import { FloatingActionButton } from '@knockdog/ui';
import { useSearchMachine } from '../model/useSearchMachine';
import { getLocationPermission, isEqualCoord, requestLocationPermission, useGeolocationQuery } from '@shared/lib';
import { useBasePointType } from '@shared/store';

interface CurrentLocationFABProps {
  onPermissionDenied: () => void;
}

export function CurrentLocationFAB({ onPermissionDenied }: CurrentLocationFABProps) {
  const { dispatch, liveState } = useSearchMachine();
  const { data: currentLocation, refetch } = useGeolocationQuery({ enabled: false });
  const { setBaseType } = useBasePointType();
  const isAtCurrentLocation = !!currentLocation && isEqualCoord(liveState.center, currentLocation);

  const handleClick = async () => {
    try {
      const status = await getLocationPermission();

      // 권한이 없으면 요청
      if (status !== 'allowed') {
        const permissionResult = await requestLocationPermission();

        if (permissionResult.status === 'denied') {
          setBaseType('CURRENT');
          onPermissionDenied();
          void refetch();
          return;
        }

        // 권한이 허용되지 않았으면 중단
        if (permissionResult.status !== 'allowed') {
          return;
        }
      }

      setBaseType('CURRENT');
      // 권한이 있을 때만 위치 정보 가져오기
      const result = await refetch();
      if (result.data) {
        dispatch({ type: 'BASEPOINT_SYNC', payload: { basePoint: result.data, reason: 'explicit' } });
      }
    } catch (error) {
      // 권한 요청 실패 시 조용히 처리
    }
  };

  return (
    <FloatingActionButton
      icon='LocationSearching'
      label='현재 위치'
      variant='neutralLight'
      size='medium'
      onClick={handleClick}
      extended={false}
      className='min-w-[53px] max-w-[53px] !shadow-[0_2px_6px_0_rgba(0,0,0,0.12)]'
      iconClassName={isAtCurrentLocation ? 'text-fill-primary-500' : 'text-fill-secondary-400'}
    />
  );
}
