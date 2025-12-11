import { useEffect, useState } from 'react';
import type { PermissionStatus } from '@knockdog/bridge-core';
import { getCurrentLocation } from '@shared/lib/geolocation';
import { getReverseGeocode } from '@features/address-picker/api/searchAddress';

function useLocationPermission() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<{
    primaryText: string | undefined;
    primaryRoad: string | undefined;
    primaryParcel: string | undefined;
    isLoading: boolean;
    error: string | null;
  }>({
    primaryText: undefined,
    primaryRoad: undefined,
    primaryParcel: undefined,
    isLoading: false,
    error: null,
  });

  async function getLocation() {
    const location = await getCurrentLocation();
    setLocation(location.coords);
  }

  // permission이 allowed일 때 위치 가져오기
  useEffect(() => {
    if (permissionStatus === 'allowed') {
      (async () => {
        await getLocation();
      })();
    }
  }, [permissionStatus]);

  // 위치가 변경되면 주소 가져오기
  useEffect(() => {
    if (location && permissionStatus === 'allowed' && location.latitude !== 0 && location.longitude !== 0) {
      setAddress((prev) => ({ ...prev, isLoading: true, error: null }));
      getReverseGeocode(location.latitude, location.longitude)
        .then((response) => {
          const firstDoc = response.documents[0];
          setAddress({
            primaryText: firstDoc?.road_address?.address_name || firstDoc?.address?.address,
            primaryRoad: firstDoc?.address?.roadAddress,
            primaryParcel: firstDoc?.address?.address,
            isLoading: false,
            error: null,
          });
        })
        .catch((err) => {
          setAddress((prev) => ({
            ...prev,
            isLoading: false,
            error: err instanceof Error ? err.message : '주소를 가져오는데 실패했습니다.',
          }));
        });
    }
  }, [location?.latitude, location?.longitude, permissionStatus]);

  // 초기 permission 체크
  useEffect(() => {
    async function checkPermission() {
      try {
        const status = await getCurrentLocation.getPermission();
        setPermissionStatus(status);
      } catch (error) {
        console.error('권한 확인 실패:', error);
        setPermissionStatus('denied');
      }
    }

    checkPermission();
  }, []);

  // 앱이 다시 foreground로 돌아올 때 permission 재확인
  useEffect(() => {
    async function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        const status = await getCurrentLocation.getPermission();
        setPermissionStatus(status);
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
  };
}

export { useLocationPermission };
