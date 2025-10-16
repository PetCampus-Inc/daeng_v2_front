import { useInfiniteQuery, type UseInfiniteQueryResult } from '@tanstack/react-query';
import { DogSchoolWithMeta, DogSchoolWithMetaResult } from './mappers';
import { kindergartenQueryOptions } from '../api/kindergartenQuery';
import { useSort } from './useSortContext';
import type { FilterOption } from '@entities/kindergarten';
import { useBasePoint } from '@shared/lib';
import { createSafeContext } from '@shared/lib/react/useSafeContext';

interface ProviderProps {
  children: React.ReactNode;
  bounds: naver.maps.LatLngBounds | null;
  zoomLevel: number;
  filters?: FilterOption[];
}

interface KindergartenSearchContextValue {
  query: UseInfiniteQueryResult<
    {
      pages: DogSchoolWithMetaResult[];
      pageParams: number[];
    },
    Error
  >;
  schoolList: DogSchoolWithMeta[];
  bounds: naver.maps.LatLngBounds | null;
}

const [KindergartenSearchContext, useKindergartenSearch] =
  createSafeContext<KindergartenSearchContextValue>('KindergartenSearchContext');

export function KindergartenSearchContextImpl({ children, bounds, zoomLevel, filters = [] }: ProviderProps) {
  const { coord: basePoint } = useBasePoint();
  const { sortType } = useSort();

  const query = useInfiniteQuery({
    ...kindergartenQueryOptions.searchList({
      refPoint: basePoint!,
      bounds: bounds!,
      zoomLevel,
      filters,
      rank: sortType,
    }),
  });

  const schoolList = query.data?.pages?.flatMap((page) => page.schoolResult.list) || [];

  return <KindergartenSearchContext value={{ query, bounds, schoolList }}>{children}</KindergartenSearchContext>;
}

export { KindergartenSearchContextImpl as KindergartenSearchContext, useKindergartenSearch };
