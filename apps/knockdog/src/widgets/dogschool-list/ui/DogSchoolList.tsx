import React from 'react';
import { Icon, SegmentedControl, SegmentedControlItem } from '@knockdog/ui';
import { DogSchoolCard } from '@features/dogschool-list';
import { filterOptions, type DogSchool } from '@entities/dogschool';

export interface DogSchoolListProps {
  data: DogSchool[];
  selectedLocation: 'current' | 'home' | 'work';
  onLocationChange: (location: 'current' | 'home' | 'work') => void;
  // onFilterToggle: (id: string) => void;
}

export function DogSchoolList({
  data,
  selectedLocation,
  onLocationChange,
  // onFilterToggle,
}: DogSchoolListProps) {
  const handleLocationChange = (value: string) => {
    onLocationChange(value as 'current' | 'home' | 'work');
  };

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
            <div className='bg-fill-secondary-0 outline-line-200 gap-x0_5 radius-full px-x3 py-x2 body2-semibold text-text-primary flex shrink-0 items-center outline-[1.4px] outline-offset-[-1.40px]'>
              <Icon icon='Filter' className='size-x4 text-fill-secondary-700' />
              필터
            </div>
            {/* 구분선 */}
            <div className='bg-line-200 h-[14px] w-px shrink-0' />
            {/* 필터 칩들 */}
            <div className='flex shrink-0 items-center'>
              {filterOptions.map((option) => (
                <div
                  key={option}
                  className='px-x2 body2-semibold text-text-primary flex shrink-0 cursor-pointer items-center gap-x-1'
                  // onClick={() => onFilterToggle(option)}
                >
                  <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
                    <rect
                      x='3'
                      y='3'
                      width='10'
                      height='10'
                      rx='5'
                      fill='#B4B4BB'
                    />
                  </svg>
                  {option}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {data.map((item) => (
        <DogSchoolCard key={item.providerId} {...item} />
      ))}
    </main>
  );
}
