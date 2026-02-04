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
   * 이미지 미디어 타입 default: 'images'
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

type PickImageResult = 
| { cancelled: true; assets?: never; }  
| { cancelled: false; assets: ImageAsset[]; } 

export type { PickImageParams, ImageAsset, PickImageResult };