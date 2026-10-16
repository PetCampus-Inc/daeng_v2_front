/** 페이지 진입·페이지 이동, 기존 콘텐츠 없는 조회, infinite scroll 추가 조회 */
const LOADING_SPINNER_DELAY_MS = 0;

/** 등록/수정/삭제, 이미지·파일 업로드 */
const ACTION_LOADING_DELAY_MS = 0;

/** 기존 콘텐츠가 보이는 상태에서 갱신 (200~300ms) */
const REFRESH_LOADING_DELAY_MS = 250;

/**
 * 등록/수정/삭제의 정책 목표 값 (요청 즉시 잠그고 250ms 이상 걸릴 때 Spinner).
 * 아직 문의·아이디어 제안 화면만 쓴다. 앱 전체 적용은 ACTION_LOADING_DELAY_MS를 바꿀 때 함께 정한다
 */
const ACTION_SPINNER_DELAY_MS = 250;

export { LOADING_SPINNER_DELAY_MS, ACTION_LOADING_DELAY_MS, REFRESH_LOADING_DELAY_MS, ACTION_SPINNER_DELAY_MS };
