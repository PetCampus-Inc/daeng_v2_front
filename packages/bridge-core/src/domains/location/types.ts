/**
 * Location domain
 */


type Accuracy = 'balanced' | 'high' | 'low';

type PermissionStatus = 'allowed' | 'denied' | 'undetermined';

interface LocationCoords {
  /**
   * 위도
   */
  latitude: number;
  /**
   * 경도
   */
  longitude: number;
  /**
   * 정확도
   */
  accuracy: number | null;
  /**
   * 고도
   */
  altitude: number | null;
  /**
   * 고도 정확도
   */
  altitudeAccuracy: number | null;
  /**
   * 방향
   */
  heading: number | null;
  /**
   * 속도
   */
  speed: number | null;
}

type Location = {
  /**
   * 자세한 위치 정보
   */
  coords: LocationCoords;
  /**
   * 위치가 업데이트된 시점의 타임스탬프
   */
  timestamp: number;
};

/** isLocationServiceEnabled 결과 */
type IsLocationServiceEnabledResult = {
  enabled: boolean;
};

/** getLastKnownLocation 파라미터 */
type GetLastKnownLocationParams = {
  maxAge?: number;
};

/** getLastKnownLocation 결과 */
type GetLastKnownLocationResult = Location | null;

export type { Accuracy, Location, PermissionStatus, IsLocationServiceEnabledResult, GetLastKnownLocationParams, GetLastKnownLocationResult }
