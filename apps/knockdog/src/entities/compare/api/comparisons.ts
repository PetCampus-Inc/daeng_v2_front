import { KindergartenComparison } from '../model/types';
import { api, ApiResponse } from '@shared/api';

export interface ComparisonsParams {
  ids: string[];
}

function getComparisons({ ids }: ComparisonsParams): Promise<ApiResponse<KindergartenComparison[]>> {
  const queryString = ids.map((id) => `ids=${encodeURIComponent(id)}`).join('&');

  return api.get(`kindergarten/comparisons?${queryString}`).json();
}

export { getComparisons };
