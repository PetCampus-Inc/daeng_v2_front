import { METHODS, BridgeException, type Accuracy, type Location, type PermissionStatus } from '@knockdog/bridge-core';
import { isNativeWebView } from '../device';
import { getBridgeInstance } from '../bridge';

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

interface GetCurrentLocationOptions {
  accuracy: Accuracy;
}

/**
 * 현재 위치 권한 에러
 */
export class GetLocationPermissionError extends Error {
  constructor(message = '위치 권한이 거부되었습니다') {
    super(message);
    this.name = 'GetLocationPermissionError';
  }
}

/**
 * 현재 위치 가져오기
 * - 앱 환경: bridge를 통해 네이티브에서 위치 정보 가져오기
 * - 웹 환경: 브라우저 Geolocation API 사용
 */
export async function getCurrentLocation(
  options: GetCurrentLocationOptions | GeolocationOptions = { accuracy: 'high' }
): Promise<Location | { coords: { latitude: number; longitude: number } }> {
  // 앱 환경
  if (isNativeWebView()) {
    const bridge = getBridgeInstance();

    if (!bridge) {
      throw new Error('Bridge not initialized');
    }

    try {
      return await bridge.request<Location>(METHODS.getCurrentLocation, options);
    } catch (error) {
      if (error instanceof BridgeException && error.code === 'EPERMISSION') {
        throw new GetLocationPermissionError(error.message);
      }
      throw error;
    }
  }

  // 웹 환경
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('geolocation_unavailable'));
      return;
    }

    const browserOptions = {
      timeout: 10_000,
      maximumAge: 300_000,
      enableHighAccuracy: !!(options as GeolocationOptions).enableHighAccuracy,
      ...(options as GeolocationOptions),
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude } }),
      (err) => {
        console.warn('위치 정보를 가져올 수 없습니다:', err.message);
        if (err.code === err.PERMISSION_DENIED) {
          reject(new GetLocationPermissionError(err.message));
        } else {
          reject(err);
        }
      },
      browserOptions
    );
  });
}

/**
 * 위치 권한 상태 확인
 * @description 앱 환경에서만 사용 가능
 */
getCurrentLocation.getPermission = async (): Promise<PermissionStatus> => {
  const bridge = getBridgeInstance();

  if (!bridge) {
    throw new Error('Bridge not initialized');
  }

  const { status } = await bridge.request<{ status: PermissionStatus }>(METHODS.getLocationPermission, {});
  return status;
};

/**
 * 위치 권한 요청 다이얼로그 열기
 * @description 앱 환경에서만 사용 가능
 */
getCurrentLocation.openPermissionDialog = async (): Promise<PermissionStatus> => {
  const bridge = getBridgeInstance();

  if (!bridge) {
    throw new Error('Bridge not initialized');
  }

  const { status } = await bridge.request<{ status: PermissionStatus }>(METHODS.openLocationPermissionDialog, {});
  return status;
};
