import { METHODS } from '../../rpc';
import type { Accuracy, Location, IsLocationServiceEnabledResult, GetLastKnownLocationParams, GetLastKnownLocationResult, PermissionStatus } from './types';

interface LocationRPCSchema {
  [METHODS.getCurrentLocation]: {
    params: { accuracy?: Accuracy };
    result: Location;
  };
  [METHODS.getLatLng]: {
    params: {
      accuracy?: 'balanced' | 'high' | undefined;
    };
    result: {
      lat: number;
      lng: number;
    };
  };
  [METHODS.getLocationPermission]: {
    params: {};
    result: { status: PermissionStatus };
  };
  [METHODS.requestLocationPermission]: {
    params: {};
    result: { status: PermissionStatus; canAskAgain: boolean };
  };
  [METHODS.isLocationServiceEnabled]: {
    params: {};
    result: IsLocationServiceEnabledResult;
  };
  [METHODS.getLastKnownLocation]: {
    params: GetLastKnownLocationParams;
    result: GetLastKnownLocationResult;
  };
  [METHODS.requestCameraPermission]: {
    params: {};
    result: { status: PermissionStatus; canAskAgain: boolean };
  };
  [METHODS.requestPhotosPermission]: {
    params: {};
    result: { status: PermissionStatus; canAskAgain: boolean };
  };
  [METHODS.getNotificationPermission]: {
    params: {};
    result: { status: PermissionStatus; canAskAgain: boolean };
  };
  [METHODS.requestNotificationPermission]: {
    params: {};
    // 이미 허용된 상태라 요청을 생략했는지, 이번 흐름에서 OS 권한을 요청했는지 구분한다.
    result: { status: PermissionStatus; canAskAgain: boolean; requested: boolean };
  };
}

export type { LocationRPCSchema };
