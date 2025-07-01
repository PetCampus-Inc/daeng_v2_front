import { useState, useCallback, useMemo } from 'react';
import {
  type FilterCategory,
  type FilterState,
  type FilterOptions,
  FILTER_CONFIG,
} from '@entities/search-filter';

export interface UseSearchFilterReturn {
  /** 필터 상태 */
  filter: FilterState;
  /** 결과 개수 */
  resultCount: number | null;

  /** 필터 옵션 토글 핸들러 */
  onToggleOption: (category: FilterCategory, option: FilterOptions) => void;
  /** 필터 옵션 제거 핸들러 */
  onRemoveOption: (category: FilterCategory, option: FilterOptions) => void;
  /** 전체 필터 초기화 핸들러 */
  onClearAll: () => void;
  /** 결과 개수 변경 핸들러 */
  onChangeResultCount: (count: number | null) => void;

  /** 필터 옵션 선택 여부 */
  isSelectedOption: (
    category: FilterCategory,
    option: FilterOptions
  ) => boolean;
  /** 필터가 없는지 여부 */
  isEmptyFilters: boolean;
  /** 선택된 필터들 가져오기 */
  getSelectedFilters: () => Array<{
    category: FilterCategory;
    option: FilterOptions;
    categoryLabel: string;
    optionLabel: string;
  }>;
}

export function useSearchFilter(
  initialState: FilterState = {}
): UseSearchFilterReturn {
  const [filter, setFilter] = useState<FilterState>(initialState);
  const [resultCount, setResultCount] = useState<number | null>(null);

  const onChangeResultCount = useCallback((count: number | null) => {
    setResultCount(count);
  }, []);

  /** 필터 옵션 토글 */
  const onToggleOption = useCallback(
    (category: FilterCategory, option: FilterOptions) => {
      setFilter((prev) => {
        const currentOptions = prev[category] || [];
        const isSelected = currentOptions.includes(option);

        if (isSelected) {
          // 제거
          const updated = currentOptions.filter((o) => o !== option);
          if (updated.length === 0) {
            const { [category]: _, ...rest } = prev;
            return rest;
          }
          return { ...prev, [category]: updated };
        } else {
          // 추가
          return {
            ...prev,
            [category]: [...currentOptions, option],
          };
        }
      });
    },
    []
  );

  /** 필터 옵션 제거 */
  const onRemoveOption = useCallback(
    (category: FilterCategory, option: FilterOptions) => {
      setFilter((prev) => {
        const currentOptions = prev[category] || [];
        const updated = currentOptions.filter((o) => o !== option);

        if (updated.length === 0) {
          const { [category]: _, ...rest } = prev;
          return rest;
        }

        return { ...prev, [category]: updated };
      });
    },
    []
  );
  /** 전체 필터 제거 */
  const onClearAll = useCallback(() => {
    setFilter({});
    setResultCount(null);
  }, []);

  /** 필터 옵션 선택 여부 */
  const isSelectedOption = useCallback(
    (category: FilterCategory, option: FilterOptions) => {
      const categoryOptions = filter[category];
      return Boolean(categoryOptions?.includes(option));
    },
    [filter]
  );

  /** 선택된 필터들 가져오기 */
  const getSelectedFilters = useCallback(() => {
    return Object.entries(filter).flatMap(([category, options]) =>
      options.map((option) => {
        const cat = category as FilterCategory;
        return {
          category: cat,
          option,
          categoryLabel: FILTER_CONFIG[cat].label,
          optionLabel: (FILTER_CONFIG[cat].options as any)[option] || option,
        };
      })
    );
  }, [filter]);

  /** 선택된 필터가 없는지 여부 */
  const isEmptyFilters = useMemo(() => {
    return Object.values(filter).every((options) => options.length === 0);
  }, [filter]);

  return {
    filter,
    resultCount,

    onToggleOption,
    onRemoveOption,
    onClearAll,
    onChangeResultCount,

    isSelectedOption,
    isEmptyFilters,
    getSelectedFilters,
  };
}
