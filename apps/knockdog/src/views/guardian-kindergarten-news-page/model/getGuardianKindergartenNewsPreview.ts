import { MOCK_GUARDIAN_KINDERGARTEN_NEWS } from '@views/guardian-kindergarten-news-page/config/guardianKindergartenNewsMock';
import {
  formatGuardianKindergartenNewsPublishedAt,
  isGuardianKindergartenNewsNewBadge,
} from '@views/guardian-kindergarten-news-page/lib/formatGuardianKindergartenNewsPublishedAt';
import {
  GUARDIAN_KINDERGARTEN_NEWS_PREVIEW_LIMIT,
  type GuardianKindergartenNewsItem,
  type GuardianKindergartenNewsPreviewItem,
} from '@views/guardian-kindergarten-news-page/model/guardianKindergartenNews';

function sortByLatest(items: GuardianKindergartenNewsItem[]) {
  return [...items].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

function toPreviewItem(item: GuardianKindergartenNewsItem, now = new Date()): GuardianKindergartenNewsPreviewItem {
  const publishedAt = new Date(item.publishedAt);
  return {
    ...item,
    publishedAtLabel: formatGuardianKindergartenNewsPublishedAt(publishedAt, now),
    showNewBadge: isGuardianKindergartenNewsNewBadge(publishedAt, now),
  };
}

/** 최신 등록순 전체 목록 (라벨/배지 포함) */
function getGuardianKindergartenNewsList(now = new Date()): GuardianKindergartenNewsPreviewItem[] {
  return sortByLatest(MOCK_GUARDIAN_KINDERGARTEN_NEWS).map((item) => toPreviewItem(item, now));
}

/** 홈 프리뷰 — 최신 등록순 최대 3건 */
function getGuardianKindergartenNewsPreview(now = new Date()): GuardianKindergartenNewsPreviewItem[] {
  return getGuardianKindergartenNewsList(now).slice(0, GUARDIAN_KINDERGARTEN_NEWS_PREVIEW_LIMIT);
}

function getGuardianKindergartenNewsById(
  newsId: string,
  now = new Date()
): GuardianKindergartenNewsPreviewItem | null {
  const found = MOCK_GUARDIAN_KINDERGARTEN_NEWS.find((item) => item.id === newsId);
  return found ? toPreviewItem(found, now) : null;
}

export {
  getGuardianKindergartenNewsById,
  getGuardianKindergartenNewsList,
  getGuardianKindergartenNewsPreview,
};
