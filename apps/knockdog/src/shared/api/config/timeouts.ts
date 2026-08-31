const API_TIMEOUT_MS = {
  /** 일반 조회·등록/수정/삭제 */
  default: 15_000,
  /** 로그인/인증 */
  auth: 10_000,
  /** 이미지·파일 업로드(S3 PUT 등) */
  upload: 60_000,
} as const;

export { API_TIMEOUT_MS };
