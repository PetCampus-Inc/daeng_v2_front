const METHODS = {
  getLatLng: 'device.getLatLng',
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

type PickImageParams = {
  allowsEditing?: boolean; // 이미지 편집 허용 여부
  quality?: number; // 0~1 사이의 압축 품질
  aspect?: [number, number]; // 종횡비 [가로, 세로]
  mediaTypes?: 'images' | 'videos' | 'all'; // 미디어 타입
};

type PickImagesParams = {
  quality?: number; // 0~1 사이의 압축 품질
  orderedSelection?: boolean; // 선택 순서 유지 여부 (iOS만 지원)
  selectionLimit?: number; // 선택 가능한 최대 개수 (0 = 무제한)
};

type ImageAsset = {
  uri: string; // 이미지 URI
  width: number; // 이미지 너비
  height: number; // 이미지 높이
  fileSize?: number; // 파일 크기 (bytes)
  type?: 'image' | 'video' | 'livePhoto' | 'pairedVideo'; // 미디어 타입
  fileName?: string; // 파일명
  mimeType?: string; // MIME 타입
};

type PickImageResult = {
  cancelled: boolean; // 취소 여부
  assets?: ImageAsset[]; // 선택된 이미지들
};

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
  PickImageParams,
  PickImagesParams,
  PickImageResult,
  ImageAsset,
};
