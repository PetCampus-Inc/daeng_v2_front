interface OwnerKindergartenNewsItem {
  id: string;
  /** 공지 — 목록 최상단 고정, 서비스상 최대 1건 */
  isAnnouncement: boolean;
  /** ISO 8601 작성 시각 */
  publishedAt: string;
  /**
   * 보호자 읽음 수.
   * 보호자가 상세 최초 진입 시 +1, 원장/보호자 재열람은 누적하지 않음.
   */
  readCount: number;
  title: string;
  /** 본문 전문 — 목록에서는 2줄 미리보기 */
  body: string;
  /** 첫 번째 등록 이미지. 없으면 null */
  thumbnailUrl: string | null;
}

/** 목록 렌더용 (작성시각 라벨/새소식 배지 파생) */
interface OwnerKindergartenNewsListItemView extends OwnerKindergartenNewsItem {
  publishedAtLabel: string;
  /** 업로드 후 KST 기준 3일간 유지 */
  showNewBadge: boolean;
}

const OWNER_KINDERGARTEN_NEWS_PAGE_SIZE = 30;
/** 새소식 배지 유지 기간 (ms) */
const OWNER_KINDERGARTEN_NEWS_NEW_BADGE_MS = 3 * 24 * 60 * 60 * 1000;

export type { OwnerKindergartenNewsItem, OwnerKindergartenNewsListItemView };
export { OWNER_KINDERGARTEN_NEWS_PAGE_SIZE, OWNER_KINDERGARTEN_NEWS_NEW_BADGE_MS };
