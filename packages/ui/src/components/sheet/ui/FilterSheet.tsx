'use client';
import { SheetClose } from './Sheet';
import { Button } from '../../button';
import { cn } from '@knockdog/ui/lib';
import type { BaseSheetProps } from '../types';
import SheetLayout from './SheetLayout';

import { useFilterSelection } from '../hooks/useFilterSelection';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSheetProps extends BaseSheetProps {
  options: FilterOption[];
  selectedOption?: string;
  onSelectOption?: (selectedOption: string) => void;
  defaultOption?: string;
}

interface FilterSheetItemProps {
  option: FilterOption;
  isSelected: boolean;
  onSelect: (selectedOption: string) => void;
}

const FilterSheetItem = ({
  option,
  isSelected,
  onSelect,
}: FilterSheetItemProps) => {
  const handleClick = () => {
    onSelect(option.value);
  };
  return (
    <div
      role='option'
      aria-selected={isSelected}
      className={cn('border-b-gray5 border-b p-2')}
      onClick={handleClick}
    >
      <span
        className={cn(
          isSelected ? 'text-primary font-bold' : 'text-black',
          'size-lg'
        )}
      >
        {option.label}
      </span>
    </div>
  );
};

const FilterSheet = ({
  title = '정렬',
  options,
  selectedOption: externalSelectedOption,
  onSelectOption,
  onOpenChange,
  defaultOption = '',
  ...restProps
}: FilterSheetProps) => {
  const { selectedValue, handleSelect } = useFilterSelection({
    externalSelectedOption,
    defaultOption,
    onSelectOption,
  });
  const handleClose = () => {
    onOpenChange?.(false);
  };

  const content = (
    <div role='listbox' aria-label={title} className='text-left'>
      {options.map((option) => (
        <FilterSheetItem
          key={option.value}
          option={option}
          isSelected={selectedValue === option.value}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );

  return (
    <SheetLayout
      {...restProps}
      title={title}
      footer={
        <SheetClose asChild>
          <Button className='grow' onClick={handleClose}>
            닫기
          </Button>
        </SheetClose>
      }
    >
      {content}
    </SheetLayout>
  );
};

export { FilterSheet };
