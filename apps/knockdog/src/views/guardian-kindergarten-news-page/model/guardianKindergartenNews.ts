interface GuardianKindergartenNewsAuthor {
  name: string;
  profileImageUrl: string | null;
}

interface GuardianKindergartenNewsItem {
  id: string;
  title: string;
  body: string;
  /** ISO 8601 등록 시각 */
  publishedAt: string;
  /** 공지 — 목록 최상단 고정 */
  isAnnouncement: boolean;
  /** 첨부 이미지 (등록 순) */
  imageUrls: string[];
  author: GuardianKindergartenNewsAuthor;
}

interface GuardianKindergartenNewsListItemView extends GuardianKindergartenNewsItem {
  publishedAtLabel: string;
  /** 업로드 후 KST 기준 3일(72h) */
  showNewBadge: boolean;
}

/** 홈 프리뷰 최대 노출 건수 */
const GUARDIAN_KINDERGARTEN_NEWS_PREVIEW_LIMIT = 3;
/** 목록 페이지당 건수 */
const GUARDIAN_KINDERGARTEN_NEWS_PAGE_SIZE = 30;
/** 새소식 배지 유지 기간 (ms) — KST 기준 3일 */
const GUARDIAN_KINDERGARTEN_NEWS_NEW_BADGE_MS = 3 * 24 * 60 * 60 * 1000;
/** 리스트 썸네일 최대 노출 장수 */
const GUARDIAN_KINDERGARTEN_NEWS_THUMB_LIMIT = 4;
/** 헤더 유치원명 최대 글자 수 */
const GUARDIAN_KINDERGARTEN_NEWS_TITLE_NAME_MAX = 10;

export type {
  GuardianKindergartenNewsAuthor,
  GuardianKindergartenNewsItem,
  GuardianKindergartenNewsListItemView,
};
/** @alias GuardianKindergartenNewsListItemView — 홈 프리뷰 동일 뷰모델 */
export type GuardianKindergartenNewsPreviewItem = GuardianKindergartenNewsListItemView;
export {
  GUARDIAN_KINDERGARTEN_NEWS_PREVIEW_LIMIT,
  GUARDIAN_KINDERGARTEN_NEWS_PAGE_SIZE,
  GUARDIAN_KINDERGARTEN_NEWS_NEW_BADGE_MS,
  GUARDIAN_KINDERGARTEN_NEWS_THUMB_LIMIT,
  GUARDIAN_KINDERGARTEN_NEWS_TITLE_NAME_MAX,
};
