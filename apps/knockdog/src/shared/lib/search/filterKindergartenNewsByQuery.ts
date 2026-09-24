interface KindergartenNewsSearchable {
  title: string;
  body: string;
  publishedAt: string;
}

/** 제목·본문 통합 검색 (대소문자 무시) */
function matchesKindergartenNewsQuery(item: KindergartenNewsSearchable, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return false;

  return (
    item.title.toLowerCase().includes(normalized) || item.body.toLowerCase().includes(normalized)
  );
}

/**
 * 소식 검색 결과 정렬 — 최신 등록순.
 * 공지(핀) 고정은 검색 결과에서 무시.
 */
function sortKindergartenNewsByNewest<T extends { publishedAt: string }>(items: T[]) {
  return [...items].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

function filterKindergartenNewsByQuery<T extends KindergartenNewsSearchable>(
  items: T[],
  query: string
) {
  const matched = items.filter((item) => matchesKindergartenNewsQuery(item, query));
  return sortKindergartenNewsByNewest(matched);
}

export {
  filterKindergartenNewsByQuery,
  matchesKindergartenNewsQuery,
  sortKindergartenNewsByNewest,
};
