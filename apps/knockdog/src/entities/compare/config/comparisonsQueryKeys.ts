import { getComparisons, getComparisonHistory } from '../api/comparisons';
import type { Coord } from '@shared/types';

const comparisonsQueryKeys = {
  all: ['comparisons'] as const,
  byIds: (ids: string[], basePoint?: Coord) => [...comparisonsQueryKeys.all, ...[...ids].sort(), ...(basePoint ? [basePoint.lat, basePoint.lng] : [])] as const,
  history: () => [...comparisonsQueryKeys.all, 'history'] as const,
} as const;

const createComparisonsQueryOptions = (ids: string[], basePoint?: Coord) => ({
  queryKey: comparisonsQueryKeys.byIds(ids, basePoint),
  queryFn: () => getComparisons({ ids, basePoint }),
  enabled: ids.length > 0,
});

const createComparisonHistoryQueryOptions = () => ({
  queryKey: comparisonsQueryKeys.history(),
  queryFn: () => getComparisonHistory(),
});

export { comparisonsQueryKeys, createComparisonsQueryOptions, createComparisonHistoryQueryOptions };
