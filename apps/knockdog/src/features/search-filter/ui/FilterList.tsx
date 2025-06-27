'use client';

import { FilterChip } from './FilterChip';
import {
  FILTER_CONFIG,
  type FilterCategory,
  type FilterOptions,
} from '@entities/search-filter';

interface FilterContentProps {
  isSelected: (category: FilterCategory, option: FilterOptions) => boolean;
  onToggleOption: (category: FilterCategory, option: FilterOptions) => void;
}

export function FilterList({ isSelected, onToggleOption }: FilterContentProps) {
  return (
    <div className='h-[80vh] overflow-y-auto'>
      <div className='px-x4 pt-x7 gap-x8 flex flex-col pb-[24vh]'>
        {Object.entries(FILTER_CONFIG).map(([category, config]) => (
          <div key={category} className='gap-x2 flex flex-col'>
            <h4 className='body1-bold text-text-primary'>{config.label}</h4>
            <div className='gap-x2_5 flex flex-wrap'>
              {Object.entries(config.options).map(
                ([optionKey, optionLabel]) => (
                  <FilterChip
                    key={optionKey}
                    activated={isSelected(
                      category as FilterCategory,
                      optionKey as FilterOptions
                    )}
                    onClick={() =>
                      onToggleOption(
                        category as FilterCategory,
                        optionKey as FilterOptions
                      )
                    }
                  >
                    {optionLabel}
                  </FilterChip>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
