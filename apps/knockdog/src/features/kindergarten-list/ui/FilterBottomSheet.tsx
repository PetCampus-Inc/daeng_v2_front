import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ActionButton, Icon } from '@knockdog/ui';
import { FilterList, scrollFilterListToCategory } from './FilterList';
import { FilterChip } from './FilterChip';
import { useLocalSearchFilter } from '../model/useLocalSearchFilter';
import { type Bounds } from '@shared/types';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { useWebBottomNavStore } from '@shared/store';
import { isNativeWebView } from '@shared/lib/device';
import { filterQueries } from '../api/filterQueries';
import { FILTER_CONFIG, type FilterCategory, type FilterOption } from '@entities/kindergarten';

const FILTER_CATEGORIES = Object.keys(FILTER_CONFIG) as FilterCategory[];
const DEFAULT_FILTER_CATEGORY: FilterCategory = '영업 시간';

interface FilterBottomSheetProps {
  isOpen: boolean;
  close: () => void;
  bounds: Bounds | null;
  initialFilters: FilterOption[];
  onApply: (filters: FilterOption[]) => void;
  initialCategory?: FilterCategory;
}

export function FilterBottomSheet({
  isOpen,
  close,
  bounds,
  initialFilters,
  onApply,
  initialCategory,
}: FilterBottomSheetProps) {
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>(initialCategory ?? DEFAULT_FILTER_CATEGORY);
  const filterListRef = useRef<HTMLDivElement>(null);
  const setFilterBottomSheetOpen = useWebBottomNavStore((state) => state.setFilterBottomSheetOpen);
  const {
    localFilters,
    selectedFilters,
    isLocalFilterSelected,
    onToggleLocalFilter,
    onRemoveLocalFilter,
    onClearLocalFilters,
    setLocalFilters,
    applyFilters,
  } = useLocalSearchFilter({ initialFilters, onApply });

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(initialFilters);
      setActiveCategory(initialCategory ?? DEFAULT_FILTER_CATEGORY);
    }
  }, [isOpen, initialFilters, initialCategory, setLocalFilters]);

  const handleCategorySelect = (category: FilterCategory) => {
    setActiveCategory(category);
    scrollFilterListToCategory(filterListRef.current, category);
  };

  useEffect(() => {
    if (isNativeWebView()) return;

    setFilterBottomSheetOpen(isOpen);
    return () => setFilterBottomSheetOpen(false);
  }, [isOpen, setFilterBottomSheetOpen]);

  const { data: filterResultData } = useQuery({
    ...filterQueries.resultCount({
      bounds,
      filters: localFilters,
    }),
  });

  /** 로컬 필터 변경 시 필터 결과 수 업데이트 */
  useEffect(() => {
    if (localFilters.length === 0) {
      setResultCount(null);
      return;
    }

    if (filterResultData?.totalCount !== undefined) {
      setResultCount(filterResultData.totalCount);
    }
  }, [filterResultData, localFilters.length]);

  /** 필터 적용 핸들러 */
  const handleApply = () => {
    applyFilters();
    close();
  };

  const getApplyButtonText = () => {
    // 로컬 필터 옵션이 없는 경우
    if (localFilters.length === 0) {
      return '결과보기';
    }

    // 로컬 필터 옵션이 있는 경우
    if (resultCount === null) {
      return '결과보기 0개';
    }

    if (resultCount > 999) {
      return '결과보기 999+개';
    }

    return `결과보기 ${resultCount}개`;
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={close}>
      <BottomSheet.Overlay />
      <BottomSheet.Body className='flex h-full flex-col overflow-hidden'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='shrink-0'>
          <BottomSheet.Title>필터</BottomSheet.Title>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>

        <nav
          aria-label='필터 카테고리'
          className='border-line-200 scrollbar-hide flex h-12 w-full shrink-0 overflow-x-auto border-b bg-white px-4'
        >
          {FILTER_CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type='button'
                aria-current={isActive ? 'location' : undefined}
                className={`body2-semibold flex h-full shrink-0 items-center justify-center border-b-[3px] px-4 ${
                  isActive ? 'border-line-accent text-text-accent' : 'border-transparent text-text-primary'
                }`}
                onClick={() => handleCategorySelect(category)}
              >
                {category.replace(' ∙ ', '∙')}
              </button>
            );
          })}
        </nav>

        <FilterList
          listRef={filterListRef}
          isSelected={isLocalFilterSelected}
          onToggleOption={onToggleLocalFilter}
          initialCategory={initialCategory}
          onActiveCategoryChange={setActiveCategory}
        />

        <div className='mt-auto w-full shrink-0'>
          <div
            className='flex h-6'
            style={{
              background: 'linear-gradient(0deg, #FFFFFF 0%, rgba(255,255,255,0) 100%)',
            }}
          />

          {/* 선택된 필터칩 */}
          {selectedFilters.length > 0 && (
            <div className='pt-x3 px-x4 bg-bg-0 relative flex'>
              <div className='pr-x2'>
                <button
                  className='radius-r2 border-line-200 flex h-[40px] w-[40px] items-center justify-center border'
                  onClick={onClearLocalFilters}
                >
                  <Icon icon='Trash' className='size-x6' />
                </button>
              </div>

              <div className='gap-x2 scrollbar-hide flex items-center overflow-x-scroll'>
                {selectedFilters.map(({ option, optionLabel }) => (
                  <FilterChip variant='toggle' key={option} activated onClick={() => onRemoveLocalFilter(option)}>
                    {optionLabel}
                    <Icon icon='Close' className='size-x5 text-fill-secondary-400 ml-x1' />
                  </FilterChip>
                ))}
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className='px-x4 py-x5 gap-x2 bg-bg-0 flex items-center'>
            <ActionButton variant='secondaryLine' size='large' onClick={close}>
              닫기
            </ActionButton>
            <ActionButton
              variant='primaryFill'
              size='large'
              disabled={localFilters.length > 0 && resultCount === 0}
              onClick={handleApply}
            >
              {getApplyButtonText()}
            </ActionButton>
          </div>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}
