import { useState, useCallback, useMemo } from 'react';
import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import {
  type FilterOption,
  type FilterState,
  FILTER_OPTIONS,
} from '@entities/dog-school';

export interface UseSearchFilterReturn {
  /** 필터 상태 (선택된 옵션 배열) */
  filter: FilterState;
  /** 결과 개수 */
  resultCount: number | null;

  /** 필터 옵션 토글 핸들러 */
  onToggleOption: (option: FilterOption) => void;
  /** 필터 옵션 제거 핸들러 */
  onRemoveOption: (option: FilterOption) => void;
  /** 전체 필터 초기화 핸들러 */
  onClearAll: () => void;
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

export function useSearchFilter(): UseSearchFilterReturn {
  const [urlFilters, setUrlFilters] = useQueryState(
    'filters',
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [resultCount, setResultCount] = useState<number | null>(null);

  const filter = useMemo(() => urlFilters as FilterOption[], [urlFilters]);

  const onChangeResultCount = useCallback((count: number | null) => {
    setResultCount(count);
  }, []);

  /** 필터 옵션 토글 */
  const onToggleOption = useCallback(
    (option: FilterOption) => {
      const currentFilters = [...urlFilters];
      const isSelected = currentFilters.includes(option);

      if (isSelected) {
        const updated = currentFilters.filter(
          (filterOption) => filterOption !== option
        );
        setUrlFilters(updated.length === 0 ? null : updated);
      } else {
        setUrlFilters([...currentFilters, option]);
      }
    },
    [urlFilters, setUrlFilters]
  );

  /** 필터 옵션 제거 */
  const onRemoveOption = useCallback(
    (option: FilterOption) => {
      const updated = urlFilters.filter(
        (filterOption) => filterOption !== option
      );
      setUrlFilters(updated.length === 0 ? null : updated);
    },
    [urlFilters, setUrlFilters]
  );

  /** 전체 필터 제거 */
  const onClearAll = useCallback(() => {
    setUrlFilters(null);
    setResultCount(null);
  }, [setUrlFilters]);

  /** 필터 옵션 선택 여부 */
  const isSelectedOption = useCallback(
    (option: FilterOption) => {
      return urlFilters.includes(option);
    },
    [urlFilters]
  );

  /** 선택된 필터옵션 + 라벨 가져오기 */
  const getSelectedFilterWithLabel = useCallback(() => {
    return filter.map((option) => ({
      option,
      optionLabel: FILTER_OPTIONS[option],
    }));
  }, [filter]);

  /** 선택된 필터가 없는지 여부 */
  const isEmptyFilters = useMemo(() => {
    return filter.length === 0;
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
    getSelectedFilterWithLabel,
  };
}
