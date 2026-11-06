import { METHODS, type PermissionStatus } from '@knockdog/bridge-core';
import { isNativeWebView } from '../device';
import { getBridgeInstance } from '../bridge';

/**
 * 위치 권한 상태 확인
 */
export async function getLocationPermission(): Promise<PermissionStatus> {
  if (!isNativeWebView()) {
    // 웹 환경: Permissions API 사용 (지원 시)
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        if (result.state === 'granted') return 'allowed';
        if (result.state === 'denied') return 'denied';
        return 'undetermined';
      } catch {
        return 'undetermined';
      }
    }
    return 'undetermined';
  }

  const bridge = getBridgeInstance();
  if (!bridge) {
    throw new Error('Bridge not initialized');
  }

  const { status } = await bridge.request<{ status: PermissionStatus }>(METHODS.getLocationPermission, {});
  return status;
}

/**
 * 위치 권한 요청 다이얼로그 표시
 */
export async function requestLocationPermission(): Promise<{ status: PermissionStatus; canAskAgain: boolean }> {
  if (!isNativeWebView()) {
    // 웹 환경: geolocation 호출로 권한 요청 트리거
    return new Promise((resolve) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        resolve({ status: 'denied', canAskAgain: false });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => resolve({ status: 'allowed', canAskAgain: true }),
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            resolve({ status: 'denied', canAskAgain: false });
          } else {
            resolve({ status: 'undetermined', canAskAgain: true });
          }
        },
        { timeout: 100 } // 권한 확인만 하므로 짧은 타임아웃
      );
    });
  }

  const bridge = getBridgeInstance();
  if (!bridge) {
    throw new Error('Bridge not initialized');
  }

  const { status, canAskAgain } = await bridge.request<{ status: PermissionStatus; canAskAgain: boolean }>(
    METHODS.requestLocationPermission,
    {}
  );

  return { status, canAskAgain };
}

/**
 * 위치 서비스(GPS) 활성화 상태 확인
 */
export async function isLocationServiceEnabled(): Promise<boolean> {
  if (!isNativeWebView()) {
    // 웹 환경: 확인 불가, true로 가정
    return true;
  }

  const bridge = getBridgeInstance();
  if (!bridge) {
    throw new Error('Bridge not initialized');
  }

  const { enabled } = await bridge.request<{ enabled: boolean }>(METHODS.isLocationServiceEnabled, {});
  return enabled;
}
