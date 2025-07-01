import { FilterChip } from './FilterChip';
import {
  FILTER_CONFIG,
  FILTER_OPTIONS,
  type FilterOption,
} from '@entities/dogschool';

interface FilterContentProps {
  isSelected: (option: FilterOption) => boolean;
  onToggleOption: (option: FilterOption) => void;
}

export function FilterList({ isSelected, onToggleOption }: FilterContentProps) {
  return (
    <div className='h-[80vh] overflow-y-auto'>
      <div className='px-x4 pt-x7 gap-x8 flex flex-col pb-[24vh]'>
        {Object.entries(FILTER_CONFIG).map(([category, options]) => (
          <div key={category} className='gap-x2 flex flex-col'>
            <h4 className='body1-bold text-text-primary'>{category}</h4>
            <div className='gap-x2_5 flex flex-wrap'>
              {options.map((option) => (
                <FilterChip
                  variant='toggle'
                  key={option}
                  activated={isSelected(option)}
                  onClick={() => onToggleOption(option)}
                >
                  {FILTER_OPTIONS[option]}
                </FilterChip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
