import { formatDistance } from '@shared/lib';
import type { KindergartenList, KindergartenListItem } from './kindergarten';
import type { KindergartenListItemWithMeta, KindergartenListWithMeta } from './types';

// FIXME: 향후 실제 API 사용 시 삭제 필요
interface KindergartenMemo {
  id: string;
  shopId: string;
  content: string;
  updatedAt: string;
}

// FIXME: 향후 실제 API 사용 시 삭제 필요
interface KindergartenBookmark {
  id: string;
  shopId: string;
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
  const isBookmarked = bookmarkedSet.has(school.id);

  return {
    ...rest,
    dist: formatDistance(dist, { unit: 'kilometer' }),
    memo,
    isBookmarked,
  };
}

/**
 * KindergartenList 전체를 메모/북마크와 결합하고 거리를 포맷팅한 모델로 변환
 */
function toKindergartenListWithMeta(
  listData: KindergartenList,
  memoData: KindergartenMemo[],
  bookmarkData: KindergartenBookmark[]
): KindergartenListWithMeta {
  const memoByShopId = new Map(memoData.map((memo) => [memo.shopId, memo]));
  const bookmarkedSet = new Set(bookmarkData.map((bookmark) => bookmark.shopId));

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

// FIXME: 향후 실제 API 사용 시 삭제 필요
export function createKindergartenListWithMock(data: KindergartenList): KindergartenListWithMeta {
  return toKindergartenListWithMeta(data, memoMockData, bookmarkMockData);
}

// TODO: 향후 실제 (메모, 북마크 조회) API 사용 시 사용될 함수
export function createKindergartenListWithMeta(memos: KindergartenMemo[], bookmarks: KindergartenBookmark[]) {
  return (listResponse: KindergartenList): KindergartenListWithMeta =>
    toKindergartenListWithMeta(listResponse, memos, bookmarks);
}

// FIXME: 향후 실제 API 사용 시 삭제 필요
export const memoMockData: KindergartenMemo[] = [
  {
    id: '1',
    shopId: '12',
    content:
      '시설은 진짜 좋은데 너무 비싸서 고민되는데ㅠㅠ 선생님들과 원장님과 얘기해보니 믿고 맡길 수 있을 것 같아서 돈이 아깝지 않을듯..?',
    updatedAt: '2025-01-01',
  },
];

// FIXME: 향후 실제 API 사용 시 삭제 필요
export const bookmarkMockData: KindergartenBookmark[] = [
  {
    id: '1',
    shopId: '12',
  },
  {
    id: '2',
    shopId: '36',
  },
];
