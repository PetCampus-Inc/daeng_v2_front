import * as Location from 'expo-location';
import { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS, type Accuracy, type PermissionStatus } from '@knockdog/bridge-core';

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

/**
 * 위치 정보 핸들러
 */
export function registerLocationHandlers(router: NativeBridgeRouter) {
  /**
   * 위도, 경도 가져오기
   */
  router.register(METHODS.getLatLng, async (options?: { accuracy?: 'balanced' | 'high' }) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') throw { code: 'EPERMISSION', message: '위치 권한 거부' };

    const acc = options?.accuracy === 'high' ? Location.Accuracy.High : Location.Accuracy.Balanced;

    const position = await Location.getCurrentPositionAsync({ accuracy: acc });

    return { lat: position.coords.latitude, lng: position.coords.longitude };
  });

  /**
   * 현재 위치 가져오기
   * @param {Accuracy} params.accuracy - 정확도
   */
  router.register(METHODS.getCurrentLocation, async (params: { accuracy: Accuracy }) => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== Location.PermissionStatus.GRANTED) {
      throw {
        code: 'EPERMISSION',
        message: '위치 권한 거부',
        data: { permissionStatus: mapPermissionStatus(status) },
      };
    }

    const accuracy = mapAccuracy(params.accuracy);
    const location = await Location.getCurrentPositionAsync({
      accuracy,
    });

    return {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        altitudeAccuracy: location.coords.altitudeAccuracy,
        heading: location.coords.heading,
      },
      timestamp: location.timestamp,
    };
  });

  /** 위치 권한 확인하기 */
  router.register(METHODS.getLocationPermission, async () => {
    const { status } = await Location.getForegroundPermissionsAsync();

    return {
      status: mapPermissionStatus(status),
    };
  });

  /** 위치 권한 요청 다이얼로그 열기 */
  router.register(METHODS.openLocationPermissionDialog, async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    return {
      status: mapPermissionStatus(status),
    };
  });
}
