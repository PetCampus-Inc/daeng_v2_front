import { MOCK_GUARDIAN_KINDERGARTEN_NEWS } from '@views/guardian-kindergarten-news-page/config/guardianKindergartenNewsMock';
import {
  formatGuardianKindergartenNewsDetailPublishedAt,
  formatGuardianKindergartenNewsPublishedAt,
  isGuardianKindergartenNewsNewBadge,
} from '@views/guardian-kindergarten-news-page/lib/formatGuardianKindergartenNewsPublishedAt';
import { sortGuardianKindergartenNews } from '@views/guardian-kindergarten-news-page/lib/sortGuardianKindergartenNews';
import {
  GUARDIAN_KINDERGARTEN_NEWS_PREVIEW_LIMIT,
  type GuardianKindergartenNewsItem,
  type GuardianKindergartenNewsListItemView,
} from '@views/guardian-kindergarten-news-page/model/guardianKindergartenNews';

function toListItemView(
  item: GuardianKindergartenNewsItem,
  now: Date | null = null
): GuardianKindergartenNewsListItemView {
  const publishedAt = new Date(item.publishedAt);
  return {
    ...item,
    publishedAtLabel: now
      ? formatGuardianKindergartenNewsPublishedAt(publishedAt, now)
      : formatGuardianKindergartenNewsDetailPublishedAt(publishedAt, publishedAt),
    showNewBadge: now ? isGuardianKindergartenNewsNewBadge(publishedAt, now) : false,
  };
}

function getGuardianKindergartenNewsSource() {
  return sortGuardianKindergartenNews(MOCK_GUARDIAN_KINDERGARTEN_NEWS);
}

/** 공지 우선 + 최신순 전체 목록 (라벨/배지 포함) */
function getGuardianKindergartenNewsList(now: Date | null = null): GuardianKindergartenNewsListItemView[] {
  return getGuardianKindergartenNewsSource().map((item) => toListItemView(item, now));
}

/** 홈 프리뷰 — 정렬 후 최대 3건 */
function getGuardianKindergartenNewsPreview(
  now: Date | null = null
): GuardianKindergartenNewsListItemView[] {
  return getGuardianKindergartenNewsList(now).slice(0, GUARDIAN_KINDERGARTEN_NEWS_PREVIEW_LIMIT);
}

function getGuardianKindergartenNewsById(
  newsId: string,
  now: Date | null = null
): GuardianKindergartenNewsListItemView | null {
  const found = MOCK_GUARDIAN_KINDERGARTEN_NEWS.find((item) => item.id === newsId);
  return found ? toListItemView(found, now) : null;
}

export {
  getGuardianKindergartenNewsById,
  getGuardianKindergartenNewsList,
  getGuardianKindergartenNewsPreview,
  getGuardianKindergartenNewsSource,
  toListItemView,
};
