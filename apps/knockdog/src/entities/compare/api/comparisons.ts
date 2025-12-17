import { KindergartenComparison, KindergartenShortInfo } from '../model/types';
import { api, ApiResponse } from '@shared/api';

export interface ComparisonsParams {
  ids: string[];
}

function getComparisons({ ids }: ComparisonsParams): Promise<ApiResponse<KindergartenComparison[]>> {
  const queryString = ids.map((id) => `ids=${encodeURIComponent(id)}`).join('&');

  return api.get(`kindergarten/comparisons?${queryString}`).json();
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
