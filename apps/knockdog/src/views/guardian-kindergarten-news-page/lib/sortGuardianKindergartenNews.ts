import type { GuardianKindergartenNewsItem } from '@views/guardian-kindergarten-news-page/model/guardianKindergartenNews';

/**
 * 정렬: 공지 1순위(최상단) → 그 외 신규등록순(publishedAt desc).
 */
function sortGuardianKindergartenNews(items: GuardianKindergartenNewsItem[]) {
  return [...items].sort((a, b) => {
    if (a.isAnnouncement !== b.isAnnouncement) {
      return a.isAnnouncement ? -1 : 1;
    }

    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export { sortGuardianKindergartenNews };
