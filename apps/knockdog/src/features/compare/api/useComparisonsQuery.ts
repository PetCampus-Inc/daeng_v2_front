import { useQuery } from '@tanstack/react-query';
import type { KindergartenComparison } from '@entities/compare';
import { createComparisonsQueryOptions } from '@entities/compare';
import { ApiResponse } from '@shared/api';

function useComparisonsQuery(ids: string[]) {
  return useQuery({
    ...createComparisonsQueryOptions(ids),
    select: (data: ApiResponse<KindergartenComparison[]>) => data.data,
  });
}
export { useComparisonsQuery };
