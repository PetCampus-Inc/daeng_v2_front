import { useState } from 'react';
import {
  Float,
  FloatingActionButton,
  Icon,
  SegmentedControl,
  SegmentedControlItem,
} from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { overlay } from 'overlay-kit';
import { useSearchFilter } from '../model/useSearchFilter';
import { FilterBottomSheet } from './FilterBottomSheet';
import { DogSchoolCard } from './DogSchoolCard';
import { DogSchoolEmptySection } from './DogSchoolEmptySection';
import { PermissionSection } from './PermissionSection';
import {
  FilterChip,
  FilterOption,
  FILTER_OPTIONS,
  getCombinedMockData,
} from '@entities/dog-school';
import { useBottomSheetSnapIndex } from '@shared/lib';
import { BOTTOM_BAR_HEIGHT } from '@shared/constants';

export function DogSchoolList() {
  const {
    getSelectedFilterWithLabel,
    onRemoveOption,
    onToggleOption,
    isSelectedOption,
    isEmptyFilters,
  } = useSearchFilter();

  const { isFullExtended, setSnapIndex } = useBottomSheetSnapIndex();

  // TODO: 위치 선택 기능 추가 및 훅으로 빼기
  const [selectedLocation, setSelectedLocation] = useState<
    'current' | 'home' | 'work'
  >('current');

  // TODO: 데이터 패칭 훅 추가
  const data = getCombinedMockData();
  const selectedFilters = getSelectedFilterWithLabel();

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value as 'current' | 'home' | 'work');
  };

  const openFilterBottomSheet = () =>
    overlay.open(({ isOpen, close }) => (
      <FilterBottomSheet isOpen={isOpen} close={close} />
    ));

  return (
    <>
      <main
        className={cn(
          'scrollbar-hide relative flex h-full w-full flex-col pb-[68px]',
          isFullExtended ? 'overflow-y-auto' : 'min-h-full overflow-hidden'
        )}
      >
        {/* 헤더 영역  */}
        <div className='bg-bg-0 sticky top-[-.5px] z-20'>
          <div className='px-x4 py-x4'>
            <SegmentedControl
              defaultValue={selectedLocation}
              onValueChange={handleLocationChange}
            >
              <SegmentedControlItem value='current'>
                현 위치
              </SegmentedControlItem>
              <SegmentedControlItem value='home'>집</SegmentedControlItem>
              <SegmentedControlItem value='work'>직장</SegmentedControlItem>
            </SegmentedControl>
          </div>

          <div className='border-line-200 flex h-[52px] w-full items-center border-b border-t'>
            <div className='px-x4 py-x2 scrollbar-hide flex w-full items-center gap-x-2 overflow-x-auto whitespace-nowrap'>
              {/* 필터 버튼 */}
              <button
                className={`gap-x0_5 radius-full px-x3 py-x2 body2-semibold flex shrink-0 cursor-pointer items-center outline-[1.5] outline-offset-[-1.5px] ${
                  isEmptyFilters
                    ? 'outline-line-200 bg-fill-secondary-0 text-text-primary'
                    : 'outline-line-accent bg-fill-primary-50 text-text-accent'
                }`}
                onClick={openFilterBottomSheet}
              >
                <Icon
                  icon='Filter'
                  className={`size-x4 ${
                    isEmptyFilters
                      ? 'text-fill-secondary-700'
                      : 'text-fill-primary-500'
                  }`}
                />
                필터
                {!isEmptyFilters && (
                  <span className='body2-extrabold text-text-accent'>
                    {selectedFilters.length}
                  </span>
                )}
              </button>

              {/* 구분선 */}
              <div className='bg-line-200 h-[14px] w-px shrink-0' />

              {/* 선택된 필터 칩들 */}
              {selectedFilters.map(({ option, optionLabel }) => (
                <FilterChip
                  variant='status'
                  key={option}
                  activated
                  onClick={() => onRemoveOption(option)}
                >
                  {optionLabel}
                </FilterChip>
              ))}

              {/* 전체 필터 옵션들 */}
              {Object.entries(FILTER_OPTIONS).map(
                ([optionKey, optionLabel]) => {
                  const option = optionKey as FilterOption;
                  const isSelected = isSelectedOption(option);

                  if (isSelected) return null;

                  return (
                    <FilterChip
                      variant='status'
                      key={option}
                      activated={false}
                      onClick={() => onToggleOption(option)}
                    >
                      {optionLabel}
                    </FilterChip>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* <DogSchoolEmptySection /> */}
        {/* <PermissionSection /> */}
        {/* 컨텐츠 영역  */}
        <div className='flex-1'>
          <div className='px-x4 py-x2 body2-semibold text-text-tertiary border-line-200 flex h-[52px] items-center border-b'>
            총 {data.shops.length}개
          </div>
          {data.shops.map((item) => (
            <DogSchoolCard key={item.id} {...item} />
          ))}
        </div>
      </main>

      {/* 지도보기 FAB */}
      <Float
        placement='bottom-center'
        zIndex={50}
        style={{
          bottom: `calc(${BOTTOM_BAR_HEIGHT}px + 12px)`,
        }}
      >
        <FloatingActionButton
          label='지도보기'
          size='small'
          onClick={() => setSnapIndex(0)}
        />
      </Float>
    </>
  );
}
