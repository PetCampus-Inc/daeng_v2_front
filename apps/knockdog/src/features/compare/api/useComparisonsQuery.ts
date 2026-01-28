import { useQuery } from '@tanstack/react-query';
import type { KindergartenComparison } from '@entities/compare';
import { createComparisonsQueryOptions } from '@entities/compare';
import { ApiResponse } from '@shared/api';
import type { Coord } from '@shared/types';

function useComparisonsQuery(ids: string[], basePoint?: Coord) {
  return useQuery({
    ...createComparisonsQueryOptions(ids, basePoint),
    select: (data: ApiResponse<KindergartenComparison[]>) => data.data,
  });
}
export { useComparisonsQuery };
