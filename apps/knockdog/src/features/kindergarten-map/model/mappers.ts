import type {
  KindergartenListItemWithMeta,
  KindergartenListWithMeta,
  KindergartenSearchList,
  KindergartenListItem,
} from '@entities/kindergarten';
import type { BookmarkItem } from '@entities/bookmark/model/bookmark';
import type { MemoItem } from '@entities/memo';
import { formatDistance } from '@shared/lib';

type KindergartenMemo = MemoItem;

type KindergartenBookmark = Pick<BookmarkItem, 'id'> & { shopId?: string };

/**
 * YYYY-MM-DD to YYYY.MM.DD
 */
function formatMemoDate(memo: KindergartenMemo): KindergartenMemo {
  return {
    ...memo,
    memoDate: memo.memoDate.replace(/-/g, '.'),
  };
}

/**
 * KindergartenListItem을 메모/북마크와 결합하고 거리를 포맷팅한 모델로 변환
 */
function toKindergartenListItemWithMeta(
  school: KindergartenListItem,
  memoByShopId: Map<string, KindergartenMemo>,
  bookmarkedSet: Set<string>
): KindergartenListItemWithMeta {
  const { dist, ...rest } = school;
  const memo = memoByShopId.get(school.id);
  const bookmarked = bookmarkedSet.has(school.id);

  return {
    ...rest,
    dist: formatDistance(dist, { unit: 'kilometer' }),
    memo: memo ? formatMemoDate(memo) : undefined,
    bookmarked,
  };
}

/**
 * KindergartenList 전체를 메모/북마크와 결합하고 거리를 포맷팅한 모델로 변환
 */
function toKindergartenListWithMeta({
  listData,
  memoData,
  bookmarkData,
}: {
  listData: KindergartenSearchList;
  memoData: KindergartenMemo[];
  bookmarkData: KindergartenBookmark[];
}): KindergartenListWithMeta {
  const memoByShopId = new Map(memoData.map((memo) => [String(memo.shopId), memo]));
  const bookmarkedSet = new Set(
    bookmarkData.map((bookmark) => bookmark.shopId ?? bookmark.id).filter(Boolean) as string[]
  );

  const list = listData.schoolResult.list.map((school) =>
    toKindergartenListItemWithMeta(school, memoByShopId, bookmarkedSet)
  );

  const exact = listData.schoolResult.exact
    ? toKindergartenListItemWithMeta(listData.schoolResult.exact, memoByShopId, bookmarkedSet)
    : null;

  return {
    paging: listData.paging,
    schoolResult: {
      ...listData.schoolResult,
      exact,
      list,
    },
  };
}

export function createKindergartenListWithMeta(bookmarks: KindergartenBookmark[], memos: KindergartenMemo[]) {
  return (listResponse: KindergartenSearchList): KindergartenListWithMeta =>
    toKindergartenListWithMeta({ listData: listResponse, memoData: memos, bookmarkData: bookmarks });
}
