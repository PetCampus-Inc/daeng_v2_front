const INQUIRY_PAGE_SIZE = 20;
const INQUIRY_TITLE_MAX_LENGTH = 30;
const INQUIRY_BODY_MAX_LENGTH = 500;
const INQUIRY_IMAGE_MAX_COUNT = 5;

const INQUIRY_ERROR_CODE = {
  /** 업로드 URL 발급: 형식(JPG·JPEG·PNG·HEIC·HEIF 외) 또는 20MB 초과 */
  INVALID_IMAGE_SPEC: 'INQUIRY-400-1',
  /** 문의 등록·추가 문의: 업로드되지 않았거나 본인 경로가 아닌 tempKey, 중복 tempKey, 형식·용량 위반 */
  INVALID_IMAGE: 'INQUIRY-400-2',
  /** 문의가 없거나 본인 문의가 아님 */
  NOT_FOUND: 'INQUIRY-404-1',
  /** 이미 해결된 문의에 추가 문의 */
  ALREADY_RESOLVED: 'INQUIRY-409-1',
} as const;

export {
  INQUIRY_BODY_MAX_LENGTH,
  INQUIRY_ERROR_CODE,
  INQUIRY_IMAGE_MAX_COUNT,
  INQUIRY_PAGE_SIZE,
  INQUIRY_TITLE_MAX_LENGTH,
};
