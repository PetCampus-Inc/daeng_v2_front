import type { PermissionStatus } from '@knockdog/bridge-core';

/** 위치 권한 에러 */
export class LocationPermissionError extends Error {
  readonly status: PermissionStatus;
  readonly canAskAgain: boolean;

  constructor(status: PermissionStatus, canAskAgain: boolean, message?: string) {
    super(message ?? '위치 권한이 필요합니다');
    this.name = 'LocationPermissionError';
    this.status = status;
    this.canAskAgain = canAskAgain;
  }
}

/** 위치 서비스 OFF 에러 */
export class LocationServiceDisabledError extends Error {
  constructor(message?: string) {
    super(message ?? '위치 서비스가 꺼져 있습니다');
    this.name = 'LocationServiceDisabledError';
  }
}

/** 위치 획득 불가 에러 */
export class LocationUnavailableError extends Error {
  constructor(message?: string) {
    super(message ?? '위치를 가져올 수 없습니다');
    this.name = 'LocationUnavailableError';
  }
}
