import * as Location from 'expo-location';
import { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS, LOCATION_ERROR_CODES, type Accuracy, type PermissionStatus } from '@knockdog/bridge-core';

function mapAccuracy(accuracy: Accuracy): Location.LocationAccuracy {
  switch (accuracy) {
    case 'high':
      return Location.LocationAccuracy.Highest;
    case 'balanced':
      return Location.LocationAccuracy.Balanced;
    case 'low':
      return Location.LocationAccuracy.Low;
    default:
      return Location.LocationAccuracy.Balanced;
  }
}

function mapPermissionStatus(status: Location.PermissionStatus): PermissionStatus {
  switch (status) {
    case Location.PermissionStatus.GRANTED:
      return 'allowed';
    case Location.PermissionStatus.DENIED:
      return 'denied';
    case Location.PermissionStatus.UNDETERMINED:
      return 'undetermined';
    default:
      return 'undetermined';
  }
}

// 진행 중인 GPS 요청 (중복 방지용)
let pendingLocationRequest: Promise<Location.LocationObject> | null = null;

export function registerLocationHandlers(router: NativeBridgeRouter) {
  /**
   * 위도, 경도 가져오기
   * @deprecated use `getCurrentLocation` instead
   */
  router.register(METHODS.getLatLng, async (options?: { accuracy?: 'balanced' | 'high' }) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') throw { code: LOCATION_ERROR_CODES.PERMISSION_DENIED, message: '위치 권한 거부' };

    const acc = options?.accuracy === 'high' ? Location.Accuracy.High : Location.Accuracy.Balanced;

    const position = await Location.getCurrentPositionAsync({ accuracy: acc });

    return { lat: position.coords.latitude, lng: position.coords.longitude };
  });

  /**
   * 현재 위치 가져오기
   * @param {Accuracy} params.accuracy - 정확도
   */
  router.register(METHODS.getCurrentLocation, async (params: { accuracy: Accuracy }) => {
    // 1. 권한 체크
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();

    if (status !== Location.PermissionStatus.GRANTED) {
      throw {
        code: LOCATION_ERROR_CODES.PERMISSION_DENIED,
        message: '위치 권한 필요',
        data: { permissionStatus: mapPermissionStatus(status), canAskAgain },
      };
    }

    // 2. 서비스 체크
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      throw { code: LOCATION_ERROR_CODES.SERVICE_DISABLED, message: '위치 서비스가 꺼져 있습니다.' };
    }

    // 3. 중복 요청 방지: 이미 진행 중인 요청이 있으면 같은 Promise 반환
    if (pendingLocationRequest) {
      const location = await pendingLocationRequest;
      return {
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude,
          accuracy: location.coords.accuracy,
          altitudeAccuracy: location.coords.altitudeAccuracy,
          heading: location.coords.heading,
          speed: location.coords.speed,
        },
        timestamp: location.timestamp,
      };
    }

    // 4. GPS fix
    const accuracy = mapAccuracy(params.accuracy);

    pendingLocationRequest = Location.getCurrentPositionAsync({ accuracy });

    try {
      const location = await pendingLocationRequest;

      return {
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude,
          accuracy: location.coords.accuracy,
          altitudeAccuracy: location.coords.altitudeAccuracy,
          heading: location.coords.heading,
          speed: location.coords.speed,
        },
        timestamp: location.timestamp,
      };
    } finally {
      pendingLocationRequest = null;
    }
  });

  /**
   * 위치 권한 확인
   */
  router.register(METHODS.getLocationPermission, async () => {
    const { status } = await Location.getForegroundPermissionsAsync();

    return {
      status: mapPermissionStatus(status),
    };
  });

  /**
   * 위치 권한 요청
   */
  router.register(METHODS.requestLocationPermission, async () => {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

    return {
      status: mapPermissionStatus(status),
      canAskAgain,
    };
  });

  /**
   * 위치 서비스(GPS) ON/OFF 상태 확인
   */
  router.register(METHODS.isLocationServiceEnabled, async () => {
    const enabled = await Location.hasServicesEnabledAsync();
    return { enabled };
  });

  /**
   * 캐시된 마지막 위치 즉시 반환 (GPS 호출 없음)
   * @param params.maxAge - 캐시 유효 시간 (ms). 기본값: 300000 (5분)
   */
  router.register(METHODS.getLastKnownLocation, async (params?: { maxAge?: number }) => {
    // maxAge 검증 및 sanitize: finite, non-negative 검증
    const sanitizedMaxAge =
      typeof params?.maxAge === 'number' && isFinite(params.maxAge) && params.maxAge >= 0
        ? params.maxAge
        : 300_000;

    // expo-location의 maxAge 옵션 활용 (수동 계산 불필요)
    const lastKnown = await Location.getLastKnownPositionAsync({ maxAge: sanitizedMaxAge });

    if (!lastKnown) {
      return null;
    }

    return {
      coords: {
        latitude: lastKnown.coords.latitude,
        longitude: lastKnown.coords.longitude,
        altitude: lastKnown.coords.altitude,
        accuracy: lastKnown.coords.accuracy,
        altitudeAccuracy: lastKnown.coords.altitudeAccuracy,
        heading: lastKnown.coords.heading,
        speed: lastKnown.coords.speed,
      },
      timestamp: lastKnown.timestamp,
    };
  });
}
