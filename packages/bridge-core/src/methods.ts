const METHODS = {
  getLatLng: 'device.getLatLng',
  getSafeAreaInsets: 'device.getSafeAreaInsets',
  getCurrentLocation: 'device.getCurrentLocation',
  getLocationPermission: 'device.getLocationPermission',
  openLocationPermissionDialog: 'device.openLocationPermissionDialog',
  callPhone: 'system.callPhone',
  copyToClipboard: 'system.copyToClipboard',
  share: 'system.share',
  navPush: 'system.navPush',
  navBack: 'system.navBack',
  navReset: 'system.navReset',
  navReplace: 'system.navReplace',
  naverOpenRoute: 'naver.openRoute',
  toastShow: 'toast.show',
  toastDismiss: 'toast.dismiss',
  toastClear: 'toast.clear',
  openExternalLink: 'system.openExternalLink',
} as const;

export type MethodName = (typeof METHODS)[keyof typeof METHODS];

type CallPhoneParams = {
  phoneNumber: string;
};

type CallPhoneResult = {
  opened: boolean;
  simulated?: boolean; // 시뮬레이터에서 실행된 경우
};

type ShareMandatory =
  | {
      url: string;
      message?: string;
    }
  | {
      url?: string;
      message: string;
    };

type ShareParams = ShareMandatory & {
  // iOS 전용 옵션
  subject?: string; // 이메일 공유 시 제목
  excludedActivityTypes?: string[]; // 제외할 액티비티 타입들
  tintColor?: string; // 액티비티 색상

  // Android 전용 옵션
  title?: string; // 메시지 제목 (선택사항)
  dialogTitle?: string; // 공유 다이얼로그 제목
};

type ShareResult = {
  shared: boolean; // 공유 되었는지 여부
  activityType?: string; // IOS에서 어떤 activity가 선택되었는지
};

type ToastShape = 'rounded' | 'square';
type ToastPosition = 'top' | 'bottom' | 'bottom-above-nav';
type ToastType = 'default' | 'success';

type ToastShowParams = {
  id?: string;
  title?: string;
  description?: string;
  duration?: number; // ms
  position?: ToastPosition;
  shape?: ToastShape;
  type?: ToastType;
};
type ToastDismissParams = { id?: string };
type ToastClearParams = {};

type SafeAreaInsets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

type Accuracy = 'balanced' | 'high' | 'low';

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

type PermissionStatus = 'allowed' | 'denied' | 'undetermined';

export { METHODS };
export type {
  CallPhoneParams,
  CallPhoneResult,
  ShareParams,
  ShareResult,
  ToastShowParams,
  ToastDismissParams,
  ToastClearParams,
  ToastShape,
  ToastPosition,
  ToastType,
  SafeAreaInsets,
  Accuracy,
  Location,
  PermissionStatus,
};
