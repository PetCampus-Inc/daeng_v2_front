import type { KindergartenComparison, KindergartenShortInfo } from '../model/types';
import type { Coord } from '@shared/types';
import { api, ApiResponse } from '@shared/api';

export interface ComparisonsParams {
  ids: string[];
  basePoint?: Coord;
}

function getComparisons({ ids, basePoint }: ComparisonsParams): Promise<ApiResponse<KindergartenComparison[]>> {
  const params = new URLSearchParams();

  ids.forEach((id) => params.append('ids', id));

  if (basePoint) {
    params.append('lat', basePoint.lat.toString());
    params.append('lng', basePoint.lng.toString());
  }

  return api.get(`kindergarten/comparisons?${params.toString()}`).json();
}

interface ComparisonHistoryItem {
  id: number;
  kindergartens: KindergartenShortInfo[];
  comparedAt: number[]; // [year, month, day, hour, minute, second, nanoseconds]
}

function getComparisonHistory(): Promise<ApiResponse<ComparisonHistoryItem[]>> {
  return api.get('kindergarten/comparisons/history').json();
}

// 비교 내역 삭제
function deleteComparisonHistory(id: number): Promise<ApiResponse<void>> {
  return api.delete(`kindergarten/comparisons/history/${id}`).json();
}

export { getComparisons, getComparisonHistory, deleteComparisonHistory };

export type { ComparisonHistoryItem };
