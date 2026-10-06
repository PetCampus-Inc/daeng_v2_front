import { FloatingActionButton } from '@knockdog/ui';
import { useSearchMachine } from '../model/useSearchMachine';
import { getLocationPermission, requestLocationPermission, useGeolocationQuery, openSystemSetting, isEqualCoord } from '@shared/lib';
import { useBasePointType } from '@shared/store';

export function CurrentLocationFAB() {
  const { dispatch, liveState } = useSearchMachine();
  const { data: currentLocation, refetch } = useGeolocationQuery({ enabled: false });
  const { setBaseType } = useBasePointType();
  const isAtCurrentLocation = !currentLocation || isEqualCoord(liveState.center, currentLocation);

  const handleClick = async () => {
    setBaseType('CURRENT');

    try {
      const status = await getLocationPermission();

      // 권한이 없으면 요청
      if (status !== 'allowed') {
        const permissionResult = await requestLocationPermission();

        // 권한 거부시 처리
        if (permissionResult.status === 'denied' && !permissionResult.canAskAgain) {
          // 더 이상 물어볼 수 없으면 설정 앱으로 유도
          openSystemSetting();
          return;
        }

        // 권한이 허용되지 않았으면 중단
        if (permissionResult.status !== 'allowed') {
          return;
        }
      }

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
