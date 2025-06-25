import { useEffect } from 'react';
import { ActionButton, BottomSheet, Icon } from '@knockdog/ui';
import { FilterList } from './FilterList';
import { FilterChip } from './FilterChip';
import { useSearchFilter } from '../hooks/useSearchFilter';

interface FilterBottomSheetProps {
  isOpen: boolean;
  close: () => void;
  onApply?: (resultCount: number) => void;
}

export function FilterBottomSheet({
  isOpen,
  close,
  onApply,
}: FilterBottomSheetProps) {
  const {
    filter,
    resultCount,
    onToggleOption,
    onRemoveOption,
    onClearAll,
    onChangeResultCount,
    isSelectedOption,
    isEmptyFilters,
    getSelectedFilters,
  } = useSearchFilter();

  // 필터 변경 시 결과 개수 시뮬레이션
  // TODO: 실제 결과 개수 조회 로직 추가
  useEffect(() => {
    console.log('filter', filter);

    if (isEmptyFilters) {
      onChangeResultCount(null);
      return;
    }

    const timer = setTimeout(() => {
      const mockCount = Math.floor(Math.random() * 1200);
      onChangeResultCount(mockCount);
    }, 300);

    return () => clearTimeout(timer);
  }, [filter, isEmptyFilters, onChangeResultCount]);

  /** 필터 적용 핸들러 */
  const handleApply = () => {
    if (resultCount !== null && onApply) {
      onApply(resultCount);
    }
    close();
  };

  /** 필터 바텀시트 닫기 핸들러 */
  const handleClose = () => {
    close();
  };

  /** 선택된 필터들 */
  const selectedFilters = getSelectedFilters();

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content className='fixed bottom-0 h-max w-full'>
          <BottomSheet.Handle />
          <BottomSheet.Header className='border-line-100 border-b'>
            <BottomSheet.Title>필터</BottomSheet.Title>
            <BottomSheet.Close className='absolute right-4 flex items-center justify-center'>
              <Icon icon='Close' />
            </BottomSheet.Close>
          </BottomSheet.Header>

          <FilterList
            isSelected={isSelectedOption}
            onToggleOption={onToggleOption}
          />

          <BottomSheet.Footer>
            <div
              className='flex h-[28px]'
              style={{
                background:
                  'linear-gradient(0deg, #FFFFFF 0%, rgba(255,255,255,0) 100%)',
              }}
            />

            {/* 선택된 필터칩 */}
            {selectedFilters.length > 0 && (
              <div className='pt-x3 px-x4 bg-bg-0 relative flex'>
                <div className='pr-x2'>
                  <button
                    className='radius-r2 border-line-200 flex h-[40px] w-[40px] items-center justify-center border'
                    onClick={onClearAll}
                  >
                    <Icon icon='Trash' className='size-x6' />
                  </button>
                </div>

                <div className='gap-x2 scrollbar-hide flex items-center overflow-x-scroll'>
                  {selectedFilters.map(({ category, option, optionLabel }) => (
                    <FilterChip
                      key={`${category}-${option}`}
                      activated
                      onClick={() => onRemoveOption(category, option)}
                    >
                      {optionLabel}
                      <Icon
                        icon='Close'
                        className='size-x5 text-fill-secondary-400 ml-x1'
                      />
                    </FilterChip>
                  ))}
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className='px-x4 py-x5 gap-x2 bg-bg-0 flex items-center'>
              <ActionButton
                variant='secondaryLine'
                size='large'
                onClick={handleClose}
              >
                닫기
              </ActionButton>
              <ActionButton
                variant='primaryFill'
                size='large'
                disabled={resultCount === null}
                onClick={handleApply}
              >
                {resultCount === null
                  ? '결과보기 0개'
                  : `결과보기 ${resultCount > 999 ? '999+' : resultCount}개`}
              </ActionButton>
            </div>
          </BottomSheet.Footer>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet.Root>
  );
}
