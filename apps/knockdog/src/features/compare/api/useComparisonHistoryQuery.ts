import { useQuery } from '@tanstack/react-query';
import type { ComparisonHistoryItem } from '@entities/compare';
import { createComparisonHistoryQueryOptions } from '@entities/compare';
import { ApiResponse } from '@shared/api';

function useComparisonHistoryQuery() {
  return useQuery({
    ...createComparisonHistoryQueryOptions(),
    select: (data: ApiResponse<ComparisonHistoryItem[]>) => data.data,
  });
}
export { useComparisonHistoryQuery };
