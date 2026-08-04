type ImageSource = 'camera' | 'library';


type PickImageParams = {
  /**
   * 이미지 소스
   */
  source?: ImageSource;
  /**
   * 이미지 편집 허용 여부 default: false
   */
  allowsEditing?: boolean;
  /**
   * 이미지 품질 0~1 사이의 압축 품질 default: 0.8
   */
  quality?: number;
  /**
   * 이미지 종횡비 default: [1, 1]
   */
  aspect?: [number, number];
  /**
   * 미디어 타입. 업로드 파이프라인이 이미지(JPEG 변환) 전용이라 images만 허용.
   * @default 'images'
   */
  mediaTypes?: 'images';
  /**
   * 다중 선택 여부 (기본: false)
   */
  allowsMultipleSelection?: boolean;
  /**
   * 선택 순서 유지 여부 (iOS만 지원, 다중 선택 시)
   */
  orderedSelection?: boolean;
  /**
   * 선택 가능한 최대 개수 (0 = 무제한, 다중 선택 시)
   */
  selectionLimit?: number;
}

interface ImageAsset  {
  /**
   * 업로드된 이미지 pre-signed URL
   */
  preSignedUrl: string; 
  /**
   * 업로드된 이미지 키
   */
  key: string;
};

/** 업로드에서 제외된 사유별 개수 */
interface PickImageSkipSummary {
  /** 확장자/용량 미충족 */
  invalidSpecCount: number;
  /** 원본 로드 실패·읽을 수 없음 */
  unreadableCount: number;
}

type PickImageFailureReason = 'network' | 'none_valid';

type PickImageResult =
  | { cancelled: true; assets?: never; skipped?: never; failure?: never; exceededLimit?: never }
  | {
      cancelled: false;
      assets: ImageAsset[];
      /** 일부 제외된 경우 */
      skipped?: PickImageSkipSummary;
      /** assets가 비었을 때의 실패 사유 */
      failure?: PickImageFailureReason;
      /** 선택 장수가 최대치를 초과해 잘린 경우 */
      exceededLimit?: boolean;
    };

interface SaveImageToGalleryParams {
  /**
   * 저장할 이미지 URL (pre-signed URL 등)
   */
  url: string;
  /**
   * 저장 파일명 (확장자 포함 권장)
   */
  fileName?: string;
}

interface SaveImageToGalleryResult {
  saved: boolean;
}

export type {
  PickImageParams,
  ImageAsset,
  PickImageResult,
  PickImageSkipSummary,
  PickImageFailureReason,
  SaveImageToGalleryParams,
  SaveImageToGalleryResult,
};

