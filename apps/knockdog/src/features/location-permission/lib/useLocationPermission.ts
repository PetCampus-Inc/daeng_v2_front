import { useEffect, useState } from 'react';
import type { PermissionStatus } from '@knockdog/bridge-core';
import { getCurrentLocation } from '@shared/lib/geolocation';
import { useCurrentAddress } from '@shared/lib/geolocation';

function useLocationPermission() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const {
    primaryText,
    primaryRoad,
    primaryParcel,
    isLoading,
    error,
    refetch: refetchAddress,
  } = useCurrentAddress(
    {
      lat: location?.latitude ?? 0,
      lng: location?.longitude ?? 0,
    },
    false
  );

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

  // 위치가 변경되면 주소 refetch
  useEffect(() => {
    if (location && permissionStatus === 'allowed' && location.latitude !== 0 && location.longitude !== 0) {
      refetchAddress();
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
    address: {
      primaryText,
      primaryRoad,
      primaryParcel,
      isLoading,
      error,
    },
  };
}

export { useLocationPermission };
