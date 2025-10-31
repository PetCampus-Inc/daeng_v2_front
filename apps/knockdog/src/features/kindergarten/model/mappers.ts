import type { KindergartenListItem, KindergartenSearchList } from '@entities/kindergarten';

// FIXME: 향후 실제 API 사용 시 삭제 필요
interface DogSchoolMemo {
  id: string;
  shopId: string;
  content: string;
  updatedAt: string;
}

// FIXME: 향후 실제 API 사용 시 삭제 필요
interface DogSchoolBookmark {
  id: string;
  shopId: string;
}

// TODO: 데이터 가공 후의 인터페이스는 어디서 관리할지 논의 필요
export interface DogSchoolWithMeta extends KindergartenListItem {
  memo?: DogSchoolMemo;
  isBookmarked?: boolean;
}

export interface DogSchoolWithMetaResult extends Omit<KindergartenSearchList, 'schoolResult'> {
  schoolResult: {
    totalCount: number;
    list: DogSchoolWithMeta[];
  };
}

function combineDogSchoolListWithMeta(
  listResponse: KindergartenSearchList,
  memosResponse: DogSchoolMemo[],
  bookmarksResponse: DogSchoolBookmark[]
): DogSchoolWithMetaResult {
  const memoByShopId = new Map(memosResponse.map((memo) => [memo.shopId, memo]));
  const bookmarkedSet = new Set(bookmarksResponse.map((bookmark) => bookmark.shopId));

  const combinedSchools = listResponse.schoolResult.list.map((school) =>
    combineDogSchoolWithMeta(school, memoByShopId, bookmarkedSet)
  );

  return {
    paging: listResponse.paging,
    schoolResult: {
      totalCount: listResponse.schoolResult.totalCount,
      list: combinedSchools,
    },
  };
}

function combineDogSchoolWithMeta(
  school: KindergartenListItem,
  memoByShopId: Map<string, DogSchoolMemo>,
  bookmarkedSet: Set<string>
): DogSchoolWithMeta {
  const memo = memoByShopId.get(school.id);
  const isBookmarked = bookmarkedSet.has(school.id);

  return {
    ...school,
    memo,
    isBookmarked,
  };
}

// FIXME: 향후 실제 API 사용 시 삭제 필요
export function createDogSchoolListWithMock(listResponse: KindergartenSearchList): DogSchoolWithMetaResult {
  return combineDogSchoolListWithMeta(listResponse, memoMockData, bookmarkMockData);
}

// TODO: 향후 실제 (메모, 북마크 조회) API 사용 시 사용될 함수
export function createDogSchoolListWithMeta(memos: DogSchoolMemo[], bookmarks: DogSchoolBookmark[]) {
  return (listResponse: KindergartenSearchList): DogSchoolWithMetaResult =>
    combineDogSchoolListWithMeta(listResponse, memos, bookmarks);
}

// FIXME: 향후 실제 API 사용 시 삭제 필요
export const memoMockData: DogSchoolMemo[] = [
  {
    id: '1',
    shopId: '12',
    content:
      '시설은 진짜 좋은데 너무 비싸서 고민되는데ㅠㅠ 선생님들과 원장님과 얘기해보니 믿고 맡길 수 있을 것 같아서 돈이 아깝지 않을듯..?',
    updatedAt: '2025-01-01',
  },
];

// FIXME: 향후 실제 API 사용 시 삭제 필요
export const bookmarkMockData: DogSchoolBookmark[] = [
  {
    id: '1',
    shopId: '12',
  },
  {
    id: '2',
    shopId: '36',
  },
];
