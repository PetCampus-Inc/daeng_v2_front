import { useMemo } from 'react';
import { useSearchListQuery } from './useSearchQuery';
import { useDisplayFilterContext } from './useDisplayFilterContext';
import type { KindergartenListItemWithMeta } from '@entities/kindergarten';

export function useFilteredSearchList() {
  const { listQuery, searchList, exact, ...rest } = useSearchListQuery();
  const { isOnlyBookmarked, isOnlyMemoed, isFilterActive } = useDisplayFilterContext();

  const filteredData = useMemo(() => {
    if (!isFilterActive) {
      return {
        filteredSearchList: searchList,
        filteredExact: exact,
        totalCount: listQuery.data?.pages[0]?.schoolResult.totalCount || 0,
      };
    }

    const filterFn = (item: KindergartenListItemWithMeta) => {
      if (isOnlyBookmarked && isOnlyMemoed) {
        return !!item.isBookmarked || !!item.memo;
      }

      if (isOnlyBookmarked) {
        return !!item.isBookmarked;
      }
      if (isOnlyMemoed) {
        return !!item.memo;
      }
      return true;
    };

    const filteredList = searchList.filter(filterFn);
    const filteredExactItem = exact && filterFn(exact) ? exact : null;

    const totalCount = filteredList.length + (filteredExactItem ? 1 : 0);

    return {
      filteredSearchList: filteredList,
      filteredExact: filteredExactItem,
      totalCount,
    };
  }, [searchList, exact, isOnlyBookmarked, isOnlyMemoed, isFilterActive, listQuery.data]);

  return {
    ...rest,
    listQuery,
    searchList: filteredData.filteredSearchList,
    exact: filteredData.filteredExact,
    totalCount: filteredData.totalCount,
    isFilterActive,
  };
}
