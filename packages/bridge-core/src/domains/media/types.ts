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
  /**
   * true면 S3 업로드 없이 로컬 메타만 반환 (도메인별 presigned 업로드용)
   */
  skipUpload?: boolean;
}

interface ImageAsset  {
  /**
   * 업로드된 이미지 pre-signed URL (skipUpload면 local uri/objectURL)
   */
  preSignedUrl: string; 
  /**
   * 업로드된 이미지 키 (skipUpload면 빈 문자열)
   */
  key: string;
  /** skipUpload 시 로컬 파일 URI (네이티브) */
  uri?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
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
      assets: [ImageAsset, ...ImageAsset[]];
      skipped?: PickImageSkipSummary;
      failure?: never;
      exceededLimit?: boolean;
    }
  | {
      cancelled: false;
      assets: [];
      skipped?: PickImageSkipSummary;
      failure: PickImageFailureReason;
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

interface PutFileToPresignedUrlParams {
  /** 로컬 파일 URI */
  uri: string;
  /** S3 PUT presigned URL */
  uploadUrl: string;
  contentType?: string;
}

interface PutFileToPresignedUrlResult {
  ok: boolean;
}

export type {
  PickImageParams,
  ImageAsset,
  PickImageResult,
  PickImageSkipSummary,
  PickImageFailureReason,
  SaveImageToGalleryParams,
  SaveImageToGalleryResult,
  PutFileToPresignedUrlParams,
  PutFileToPresignedUrlResult,
};

