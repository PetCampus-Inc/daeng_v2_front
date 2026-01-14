import { useEffect, useState } from 'react';
import type { PermissionStatus } from '@knockdog/bridge-core';
import { getCurrentLocation, useGeolocationQuery } from '@shared/lib/geolocation';
import { useQuery } from '@tanstack/react-query';
import { geoQueries } from '@entities/address';

function useLocationPermission() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');

  // 위치 정보 가져오기 (권한이 있을 때만 실행)
  const { data: location, ...locationQuery } = useGeolocationQuery({
    enabled: permissionStatus === 'allowed',
    options: {
      enableHighAccuracy: true,
      timeout: 10000,
    },
  });

  // 주소 정보 가져오기 (위치가 있을 때만 실행)
  const {
    data: addressDocument,
    isLoading: isAddressLoading,
    error: addressError,
  } = useQuery({
    ...geoQueries.reverseGeocode({
      lat: location?.lat ?? 0,
      lng: location?.lng ?? 0,
    }),
    enabled: !!location,
    select: (data) => data.documents?.[0],
  });

  const address = {
    addressName: addressDocument?.address?.address_name,
    isLoading: isAddressLoading || (permissionStatus === 'allowed' && !location && !locationQuery.isError),
    error: addressError ? '주소를 가져오는데 실패했습니다.' : null,
  };

  /**
   * 권한 상태 확인
   */
  const checkPermission = async () => {
    try {
      const status = await getCurrentLocation.getPermission();
      setPermissionStatus(status);
    } catch (error) {
      console.error('권한 확인 실패:', error);
      setPermissionStatus('denied');
    }
  };

  /**
   * 권한 요청 (앱 내 팝업)
   */
  const requestPermission = async () => {
    try {
      const status = await getCurrentLocation.openPermissionDialog();
      setPermissionStatus(status);
      return status;
    } catch (error) {
      console.error('권한 요청 실패:', error);
      return 'denied';
    }
  };

  // 초기 권한 확인
  useEffect(() => {
    checkPermission();
  }, []);

  // 앱 포커스 시 권한 재확인 (설정 등에서 변경했을 수 있음)
  useEffect(() => {
    async function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        await checkPermission();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    permissionStatus,
    location,
    address,
    requestPermission,
    isLoading: locationQuery.isLoading || isAddressLoading,
  };
}

export { useLocationPermission };
