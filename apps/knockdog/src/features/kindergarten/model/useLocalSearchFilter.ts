import { useState, useCallback } from 'react';
import { useSearchFilter } from './useSearchFilter';
import { type FilterOption, FILTER_OPTIONS } from '@entities/kindergarten';

interface UseLocalSearchFilterReturn {
  localFilters: FilterOption[];
  selectedFilters: Array<{
    option: FilterOption;
    optionLabel: string;
  }>;
  isLocalFilterSelected: (option: FilterOption) => boolean;
  onToggleLocalFilter: (option: FilterOption) => void;
  onRemoveLocalFilter: (option: FilterOption) => void;
  onClearLocalFilters: () => void;
  setLocalFilters: (filters: FilterOption[]) => void;
  applyFilters: () => void;
}

export function useLocalSearchFilter(): UseLocalSearchFilterReturn {
  const { setFilters: setUrlFilters } = useSearchFilter();
  const [localFilters, setLocalFilters] = useState<FilterOption[]>([]);

  /** 로컬 필터 토글 */
  const onToggleLocalFilter = useCallback((option: FilterOption) => {
    setLocalFilters((prev) => {
      const isSelected = prev.includes(option);
      if (isSelected) {
        return prev.filter((filterOption) => filterOption !== option);
      } else {
        return [...prev, option];
      }
    });
  }, []);

  /** 로컬 필터 제거 */
  const onRemoveLocalFilter = useCallback((option: FilterOption) => {
    setLocalFilters((prev) => prev.filter((filterOption) => filterOption !== option));
  }, []);

  /** 전체 필터 초기화 */
  const onClearLocalFilters = useCallback(() => {
    setLocalFilters([]);
  }, []);

  /** 필터 적용 - 로컬 필터를 URL에 직접 설정 */
  const applyFilters = useCallback(() => {
    setUrlFilters(localFilters);
  }, [localFilters, setUrlFilters]);

  /** 선택된 필터옵션 + 라벨 */
  const selectedFilters = localFilters.map((option) => ({
    option,
    optionLabel: FILTER_OPTIONS[option],
  }));

  /** 로컬 필터 선택 여부 */
  const isLocalFilterSelected = (option: FilterOption) => localFilters.includes(option);

  return {
    localFilters,
    selectedFilters,
    isLocalFilterSelected,
    onToggleLocalFilter,
    onRemoveLocalFilter,
    onClearLocalFilters,
    setLocalFilters,
    applyFilters,
  };
}
