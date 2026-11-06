import type { OwnerKindergartenNewsItem } from '@views/owner-kindergarten-news-page/model/ownerKindergartenNews';

/**
 * 정렬: 공지 1순위(최상단) → 그 외 신규등록순(publishedAt desc).
 * 공지는 서비스상 최대 1건이지만, 복수 시에도 공지 그룹을 위에 두고 그룹 내 최신순.
 */
function sortOwnerKindergartenNews(items: OwnerKindergartenNewsItem[]) {
  return [...items].sort((a, b) => {
    if (a.isAnnouncement !== b.isAnnouncement) {
      return a.isAnnouncement ? -1 : 1;
    }

    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export { sortOwnerKindergartenNews };
