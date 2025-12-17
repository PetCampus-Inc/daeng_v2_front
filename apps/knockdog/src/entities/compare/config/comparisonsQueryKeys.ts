import { getComparisons, getComparisonHistory, deleteComparisonHistory } from '../api/comparisons';

const comparisonsQueryKeys = {
  all: ['comparisons'] as const,
  byIds: (ids: string[]) => [...comparisonsQueryKeys.all, ...[...ids].sort()] as const,
  history: () => [...comparisonsQueryKeys.all, 'history'] as const,
} as const;

const createComparisonsQueryOptions = (ids: string[]) => ({
  queryKey: comparisonsQueryKeys.byIds(ids),
  queryFn: () => getComparisons({ ids }),
  enabled: ids.length > 0,
});

const createComparisonHistoryQueryOptions = () => ({
  queryKey: comparisonsQueryKeys.history(),
  queryFn: () => getComparisonHistory(),
});

export { comparisonsQueryKeys, createComparisonsQueryOptions, createComparisonHistoryQueryOptions };
