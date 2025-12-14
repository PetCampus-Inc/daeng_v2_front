import { useState, useCallback, useMemo } from 'react';
import { useSearchMachine } from '@features/kindergarten-map';
import { type FilterOption, FILTER_OPTIONS } from '@entities/kindergarten';

interface UseSearchFilterReturn {
  /** 결과 개수 */
  resultCount: number | null;

  /** 필터 옵션 토글 핸들러 */
  onToggleOption: (option: FilterOption) => void;
  /** 필터 옵션 제거 핸들러 */
  onRemoveOption: (option: FilterOption) => void;
  /** 전체 필터 초기화 핸들러 */
  onClearAll: () => void;
  /** 필터 배열 직접 설정 핸들러 */
  setFilters: (filters: FilterOption[]) => void;
  /** 결과 개수 변경 핸들러 */
  onChangeResultCount: (count: number | null) => void;

  /** 필터 옵션 선택 여부 */
  isSelectedOption: (option: FilterOption) => boolean;
  /** 필터가 없는지 여부 */
  isEmptyFilters: boolean;
  /** 선택된 필터옵션 + 라벨 가져오기 */
  getSelectedFilterWithLabel: () => Array<{
    option: FilterOption;
    optionLabel: string;
  }>;
}

/**
 * 검색 필터를 관리하는 훅
 */
export function useSearchFilter(): UseSearchFilterReturn {
  const { liveState, dispatch } = useSearchMachine();
  const { filters } = liveState;
  const [resultCount, setResultCount] = useState<number | null>(null);

  const onChangeResultCount = useCallback((count: number | null) => {
    setResultCount(count);
  }, []);

  /** 필터 옵션 토글 */
  const onToggleOption = useCallback(
    (option: FilterOption) => {
      const isSelected = filters.includes(option);
      let updated: FilterOption[];

      if (isSelected) {
        updated = filters.filter((filterOption) => filterOption !== option);
      } else {
        updated = [...filters, option];
      }

      if (updated.length > 0) {
        dispatch({ type: 'FILTERS_CHANGED', filters: updated });
      } else {
        dispatch({ type: 'CLEAR_FILTERS' });
      }
    },
    [filters, dispatch]
  );

  /** 필터 옵션 제거 */
  const onRemoveOption = useCallback(
    (option: FilterOption) => {
      const updated = filters.filter((filterOption) => filterOption !== option);
      if (updated.length > 0) {
        dispatch({ type: 'FILTERS_CHANGED', filters: updated });
      } else {
        dispatch({ type: 'CLEAR_FILTERS' });
      }
    },
    [filters, dispatch]
  );

  /** 전체 필터 제거 */
  const onClearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
    setResultCount(null);
  }, [dispatch]);

  /** 필터 배열 직접 설정 */
  const setFilters = useCallback(
    (newFilters: FilterOption[]) => {
      if (newFilters.length > 0) {
        dispatch({ type: 'FILTERS_CHANGED', filters: newFilters });
      } else {
        dispatch({ type: 'CLEAR_FILTERS' });
      }
    },
    [dispatch]
  );

  /** 필터 옵션 선택 여부 */
  const isSelectedOption = useCallback(
    (option: FilterOption) => {
      return filters.includes(option);
    },
    [filters]
  );

  /** 선택된 필터옵션 + 라벨 가져오기 */
  const getSelectedFilterWithLabel = useCallback(() => {
    return filters.map((option) => ({
      option,
      optionLabel: FILTER_OPTIONS[option],
    }));
  }, [filters]);

  /** 선택된 필터가 없는지 여부 */
  const isEmptyFilters = useMemo(() => {
    return filters.length === 0;
  }, [filters]);

  return {
    resultCount,

    onToggleOption,
    onRemoveOption,
    onClearAll,
    setFilters,
    onChangeResultCount,

    isSelectedOption,
    isEmptyFilters,
    getSelectedFilterWithLabel,
  };
}
