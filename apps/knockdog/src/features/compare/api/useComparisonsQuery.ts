import { useQuery } from '@tanstack/react-query';
import { createComparisonsQueryOptions } from '@entities/compare/config/comparisonsQueryKeys';
import { KindergartenComparison } from '@entities/compare/model/types';
import { ApiResponse } from '@shared/api';

function useComparisonsQuery(ids: string[]) {
  return useQuery({
    ...createComparisonsQueryOptions(ids),
    select: (data: ApiResponse<KindergartenComparison[]>) => data.data,
  });
}
export { useComparisonsQuery };
