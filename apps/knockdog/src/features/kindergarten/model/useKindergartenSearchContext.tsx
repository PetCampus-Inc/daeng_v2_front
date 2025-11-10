import { useInfiniteQuery, type UseInfiniteQueryResult } from '@tanstack/react-query';

import { kindergartenQueryOptions } from '../api/kindergartenQuery';
import { useSort } from './useSortContext';
import type { FilterOption, KindergartenListItemWithMeta, KindergartenListWithMeta } from '@entities/kindergarten';
import { useBasePoint } from '@shared/lib';
import { createSafeContext } from '@shared/lib/react/useSafeContext';

interface ProviderProps {
  children: React.ReactNode;
  bounds: naver.maps.LatLngBounds | null;
  zoomLevel: number;
  filters?: FilterOption[];
  query?: string;
}

interface KindergartenSearchContextValue {
  query: UseInfiniteQueryResult<
    {
      pages: KindergartenListWithMeta[];
      pageParams: number[];
    },
    Error
  >;
  schoolList: KindergartenListItemWithMeta[];
  bounds: naver.maps.LatLngBounds | null;
}

const [KindergartenSearchContext, useKindergartenSearch] =
  createSafeContext<KindergartenSearchContextValue>('KindergartenSearchContext');

export function KindergartenSearchContextImpl({
  children,
  bounds,
  zoomLevel,
  filters = [],
  query: searchQuery,
}: ProviderProps) {
  const { coord: basePoint } = useBasePoint();
  const { sortType } = useSort();

  const query = useInfiniteQuery({
    ...kindergartenQueryOptions.searchList({
      refPoint: basePoint!,
      bounds: bounds!,
      zoomLevel,
      filters,
      query: searchQuery,
      rank: sortType,
    }),
  });

  const schoolList = query.data?.pages?.flatMap((page) => page.schoolResult.list) || [];

  return <KindergartenSearchContext value={{ query, bounds, schoolList }}>{children}</KindergartenSearchContext>;
}

export { KindergartenSearchContextImpl as KindergartenSearchContext, useKindergartenSearch };
