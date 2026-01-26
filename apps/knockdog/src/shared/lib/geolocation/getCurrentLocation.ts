import {
  METHODS,
  LOCATION_ERROR_CODES,
  BridgeException,
  type Accuracy,
  type Location,
  type PermissionStatus,
} from '@knockdog/bridge-core';
import { isNativeWebView } from '../device';
import { getBridgeInstance } from '../bridge';
import { LocationPermissionError, LocationServiceDisabledError, LocationUnavailableError } from './errors';
import { getLocationPermission, isLocationServiceEnabled } from './permission';

export type LocationSource = 'lastKnown' | 'gps';
export type LocationQuality = 'approximate' | 'precise';

export interface GetCurrentLocationResult {
  location: Location;
  source: LocationSource;
  quality: LocationQuality;
}

export interface GetCurrentLocationOptions {
  /** 캐시 유효 시간 (ms). 기본값: 300000 (5분) */
  maxAge?: number;
  /** GPS 정확도. 기본값: 'balanced' */
  accuracy?: Accuracy;
  /** last-known 위치를 받았을 때 호출되는 콜백 (UI 즉시 업데이트용) */
  onLastKnown?: (location: Location) => void;
  /** 정밀 위치 획득 실패 시 last-known으로 fallback 할지 여부. 기본값: true */
  fallbackOnError?: boolean;
}

/**
 * 현재 위치 가져오기
 *
 * 1. 권한/서비스 체크
 * 2. last-known + GPS 병렬 시작 (async-parallel)
 * 3. last-known 먼저 완료되면 onLastKnown 콜백
 * 4. GPS 완료되면 최종 결과 반환
 *
 * @example
 * ```ts
 * // 기본 사용
 * const { location, quality } = await getCurrentLocation();
 *
 * // 캐시 위치로 즉시 UI 업데이트
 * const result = await getCurrentLocation({
 *   onLastKnown: (loc) => map.setCenter(loc.coords),
 * });
 * ```
 */
export async function getCurrentLocation(options: GetCurrentLocationOptions = {}): Promise<GetCurrentLocationResult> {
  const { maxAge = 300_000, accuracy = 'balanced', onLastKnown, fallbackOnError = true } = options;

  // 웹 환경
  if (!isNativeWebView()) {
    return getLocationFromBrowser(accuracy, maxAge);
  }

  const bridge = getBridgeInstance();
  if (!bridge) {
    throw new Error('Bridge not initialized');
  }

  // 1. 권한 + 서비스 병렬 체크
  const [permissionStatus, serviceEnabled] = await Promise.all([getLocationPermission(), isLocationServiceEnabled()]);

  if (permissionStatus !== 'allowed') {
    const canAskAgain = permissionStatus === 'undetermined';
    throw new LocationPermissionError(permissionStatus, canAskAgain);
  }

  if (!serviceEnabled) {
    throw new LocationServiceDisabledError();
  }

  // 2. last-known + GPS 병렬 시작 (async-parallel)
  const lastKnownPromise = bridge.request<Location | null>(METHODS.getLastKnownLocation, { maxAge }).catch(() => null); // last-known 실패는 무시

  const gpsPromise = bridge.request<Location>(METHODS.getCurrentLocation, { accuracy }, { timeoutMs: 20_000 });

  // 3. last-known 먼저 처리
  const lastKnownLocation = await lastKnownPromise;
  if (lastKnownLocation && onLastKnown) {
    onLastKnown(lastKnownLocation);
  }

  // 4. GPS 대기
  try {
    const preciseLocation = await gpsPromise;
    return {
      location: preciseLocation,
      source: 'gps',
      quality: 'precise',
    };
  } catch (error) {
    // GPS 실패 시 fallback
    if (fallbackOnError && lastKnownLocation) {
      return {
        location: lastKnownLocation,
        source: 'lastKnown',
        quality: 'approximate',
      };
    }

    // 에러 변환
    if (error instanceof BridgeException) {
      const errorData = error.data as { permissionStatus?: PermissionStatus; canAskAgain?: boolean } | undefined;

      switch (error.code) {
        case LOCATION_ERROR_CODES.PERMISSION_DENIED:
          throw new LocationPermissionError(
            errorData?.permissionStatus ?? 'denied',
            errorData?.canAskAgain ?? false,
            error.message
          );
        case LOCATION_ERROR_CODES.SERVICE_DISABLED:
          throw new LocationServiceDisabledError(error.message);
        case LOCATION_ERROR_CODES.TIMEOUT:
        case LOCATION_ERROR_CODES.UNAVAILABLE:
          throw new LocationUnavailableError(error.message);
      }
    }

    throw error;
  }
}

/**
 * 브라우저 Geolocation API (웹 환경)
 */
async function getLocationFromBrowser(accuracy: Accuracy, maxAge: number): Promise<GetCurrentLocationResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new LocationUnavailableError('Geolocation API not available'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          location: {
            coords: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              altitude: pos.coords.altitude,
              altitudeAccuracy: pos.coords.altitudeAccuracy,
              heading: pos.coords.heading,
              speed: pos.coords.speed,
            },
            timestamp: pos.timestamp,
          },
          source: 'gps',
          quality: 'precise',
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new LocationPermissionError('denied', false, err.message));
        } else {
          reject(new LocationUnavailableError(err.message));
        }
      },
      {
        enableHighAccuracy: accuracy === 'high',
        timeout: 15_000,
        maximumAge: maxAge,
      }
    );
  });
}
