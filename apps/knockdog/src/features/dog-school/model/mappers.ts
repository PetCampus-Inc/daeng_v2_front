// FIXME: 향후 실제 API 사용 시 삭제 필요
import { memoMockData, bookmarkMockData, DogSchoolMemo, DogSchoolBookmark } from '@entities/dog-school/model/mock';
import type { DogSchool, DogSchoolSearchListResponse } from '@entities/dog-school/model/dogschool-list';

export interface DogSchoolWithMeta extends DogSchool {
  memo?: DogSchoolMemo;
  isBookmarked?: boolean;
}

export interface DogSchoolWithMetaResult extends Omit<DogSchoolSearchListResponse, 'schoolResult'> {
  schoolResult: {
    totalCount: number;
    list: DogSchoolWithMeta[];
  };
}

function combineDogSchoolListWithMeta(
  listResponse: DogSchoolSearchListResponse,
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
    aggregations: listResponse.aggregations,
    schoolResult: {
      totalCount: listResponse.schoolResult.totalCount,
      list: combinedSchools,
    },
  };
}

function combineDogSchoolWithMeta(
  school: DogSchool,
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
export function createDogSchoolListWithMock(listResponse: DogSchoolSearchListResponse): DogSchoolWithMetaResult {
  return combineDogSchoolListWithMeta(listResponse, memoMockData, bookmarkMockData);
}

// TODO: 향후 실제 (메모, 북마크 조회) API 사용 시 사용될 함수
export function createDogSchoolListWithMeta(memos: DogSchoolMemo[], bookmarks: DogSchoolBookmark[]) {
  return (listResponse: DogSchoolSearchListResponse): DogSchoolWithMetaResult =>
    combineDogSchoolListWithMeta(listResponse, memos, bookmarks);
}
