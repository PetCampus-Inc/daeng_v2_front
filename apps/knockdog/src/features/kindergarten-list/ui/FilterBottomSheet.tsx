import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ActionButton, Icon } from '@knockdog/ui';
import { FilterList } from './FilterList';
import { FilterChip } from './FilterChip';
import { useLocalSearchFilter } from '../model/useLocalSearchFilter';
import { isValidLatLngBounds, toBounds } from '../lib/map-adapter';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { filterQueries } from '../api/filterQueries';
import type { FilterOption } from '@entities/kindergarten';

interface FilterBottomSheetProps {
  isOpen: boolean;
  close: () => void;
  bounds?: naver.maps.Bounds;
  initialFilters: FilterOption[];
  onApply: (filters: FilterOption[]) => void;
}

export function FilterBottomSheet({ isOpen, close, bounds, initialFilters, onApply }: FilterBottomSheetProps) {
  const [resultCount, setResultCount] = useState<number | null>(null);
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
    }
  }, [isOpen, initialFilters, setLocalFilters]);

  const abstractBounds = isValidLatLngBounds(bounds) ? toBounds(bounds) : null;
  const { data: filterResultData } = useQuery({
    ...filterQueries.resultCount({
      bounds: abstractBounds,
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
      <BottomSheet.Body className='h-full'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-100 border-b'>
          <BottomSheet.Title>필터</BottomSheet.Title>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>

        <FilterList isSelected={isLocalFilterSelected} onToggleOption={onToggleLocalFilter} />

        <div className='fixed bottom-0 w-full'>
          <div
            className='flex h-[28px]'
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
