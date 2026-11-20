import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

import { SortDropdown, type SortDropdownProps } from '../sort-dropdown';

type ListHeaderVariant = 'sort' | 'filter';

interface ListHeaderProps extends Omit<ComponentProps<'div'>, 'children'> {
  label?: ReactNode;
  count?: ReactNode;
  variant?: ListHeaderVariant;
  filterLabel?: ReactNode;
  sortProps?: SortDropdownProps;
  onFilterClick?: ComponentProps<'button'>['onClick'];
}

/** V4 / Selection / List Header */
function ListHeader({
  label = '강아지수',
  count = 5,
  variant = 'sort',
  filterLabel = '지각',
  sortProps,
  onFilterClick,
  className,
  ...props
}: ListHeaderProps) {
  return (
    <div
      className={cn(
        'bg-bg-0 flex w-full items-center justify-between pl-x4_5',
        variant === 'sort' ? 'h-[58px] py-x3 pr-x4' : 'pr-x2',
        className
      )}
      {...props}
    >
      <div className='flex items-center gap-x1'>
        <span className='label-medium text-text-secondary'>{label}</span>
        <span className='body2-bold text-text-accent'>{count}</span>
      </div>
      {variant === 'sort' ? (
        <SortDropdown {...sortProps} />
      ) : (
        <button type='button' onClick={onFilterClick} className='flex items-center gap-x1 p-x2'>
          <span className='flex size-4 items-center justify-center'>
            <span className='bg-fill-secondary-400 size-2.5 rounded-full' />
          </span>
          <span className='label-medium text-text-secondary'>{filterLabel}</span>
        </button>
      )}
    </div>
  );
}

export { ListHeader };
export type { ListHeaderProps, ListHeaderVariant };
