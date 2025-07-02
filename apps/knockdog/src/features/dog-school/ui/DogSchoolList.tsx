import { useState } from 'react';
import { overlay } from 'overlay-kit';
import { Icon, SegmentedControl, SegmentedControlItem } from '@knockdog/ui';
import { useSearchFilter } from '../model/useSearchFilter';
import { FilterBottomSheet } from './FilterBottomSheet';
import { DogSchoolCard } from './DogSchoolCard';
import {
  FilterChip,
  FilterOption,
  FILTER_OPTIONS,
  getCombinedMockData,
} from '@entities/dog-school';

export function DogSchoolList() {
  const {
    getSelectedFilterWithLabel,
    onRemoveOption,
    onToggleOption,
    isSelectedOption,
    isEmptyFilters,
  } = useSearchFilter();

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
    <main className='relative min-h-full w-full pb-[68px]'>
      <div className='bg-bg-0 sticky top-[-.5px] z-20'>
        <div className='px-x4 py-x4'>
          <SegmentedControl
            defaultValue={selectedLocation}
            onValueChange={handleLocationChange}
          >
            <SegmentedControlItem value='current'>현 위치</SegmentedControlItem>
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
            {Object.entries(FILTER_OPTIONS).map(([optionKey, optionLabel]) => {
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
            })}
          </div>
        </div>
      </div>

      <div className='px-x4 py-x2 body2-semibold text-text-tertiary border-line-200 flex h-[52px] items-center border-b'>
        총 {data.shops.length}개
      </div>
      {data.shops.map((item) => (
        <DogSchoolCard key={item.id} {...item} />
      ))}
    </main>
  );
}
