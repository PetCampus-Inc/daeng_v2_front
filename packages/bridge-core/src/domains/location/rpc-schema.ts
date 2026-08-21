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
    result: { status: PermissionStatus; canAskAgain: boolean };
  };
}

export type { LocationRPCSchema };
