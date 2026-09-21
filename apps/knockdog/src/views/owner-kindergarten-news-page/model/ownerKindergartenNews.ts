interface OwnerKindergartenNewsReader {
  id: string;
  /** 보호자 이름 (가나다 정렬 기준, '보호자' 접미사 제외) */
  guardianName: string;
  /** 등록 강아지 이름 (첫 번째가 대표) */
  dogNames: string[];
  /** 최초 열람 시각. null이면 미열람 */
  readAt: string | null;
  /** false면 연결 해제 — 미열람은 목록 제외, 열람 기록은 유지 */
  isConnected: boolean;
}

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
  /** 연결된 보호자 수 (상세 하단 읽음 현황) */
  guardianTotalCount: number;
  title: string;
  /** 본문 전문 — 목록에서는 2줄 미리보기 */
  body: string;
  /** 첫 번째 등록 이미지. 없으면 null */
  thumbnailUrl: string | null;
  /** 첨부 이미지 (등록 순). 상세에서 원본 비율로 노출 */
  imageUrls: string[];
  /** 읽음 반응 목록 (시트용) */
  readers: OwnerKindergartenNewsReader[];
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

export type {
  OwnerKindergartenNewsItem,
  OwnerKindergartenNewsListItemView,
  OwnerKindergartenNewsReader,
};
export { OWNER_KINDERGARTEN_NEWS_PAGE_SIZE, OWNER_KINDERGARTEN_NEWS_NEW_BADGE_MS };
