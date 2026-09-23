interface GuardianKindergartenNewsItem {
  id: string;
  title: string;
  body: string;
  /** ISO 8601 등록 시각 */
  publishedAt: string;
}

interface GuardianKindergartenNewsPreviewItem extends GuardianKindergartenNewsItem {
  publishedAtLabel: string;
  /** 업로드 후 KST 기준 3일(72h) */
  showNewBadge: boolean;
}

/** 홈 프리뷰 최대 노출 건수 */
const GUARDIAN_KINDERGARTEN_NEWS_PREVIEW_LIMIT = 3;
/** 새소식 배지 유지 기간 (ms) — KST 기준 3일 */
const GUARDIAN_KINDERGARTEN_NEWS_NEW_BADGE_MS = 3 * 24 * 60 * 60 * 1000;

export type { GuardianKindergartenNewsItem, GuardianKindergartenNewsPreviewItem };
export { GUARDIAN_KINDERGARTEN_NEWS_PREVIEW_LIMIT, GUARDIAN_KINDERGARTEN_NEWS_NEW_BADGE_MS };
