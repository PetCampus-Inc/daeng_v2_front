'use client';

import { useState, type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

const SORT_OPTIONS = [
  { value: 'newest', label: '최신순' },
  { value: 'name', label: '이름순' },
  { value: 'oldest', label: '오래된순' },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]['value'];

interface SortDropdownProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  value?: SortOption;
  defaultValue?: SortOption;
  onValueChange?: (value: SortOption) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function ChevronDown(props: ComponentProps<'svg'>) {
  return (
    <svg width='7.65615' height='11.2654' viewBox='0 0 7.65615 11.2654' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M5.09517 5.63271L0 1.26543L1.08465 0L7.65615 5.63271L1.08465 11.2654L0 10L5.09517 5.63271Z'
        fill='currentColor'
      />
    </svg>
  );
}

/** V4 / Selection / Sort Dropdown */
function SortDropdown({
  value,
  defaultValue = 'newest',
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  ...props
}: SortDropdownProps) {
  const [innerValue, setInnerValue] = useState<SortOption>(defaultValue);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const selected = value ?? innerValue;
  const isOpen = open ?? innerOpen;
  const selectedLabel = SORT_OPTIONS.find((option) => option.value === selected)?.label ?? SORT_OPTIONS[0].label;

  function setOpen(nextOpen: boolean) {
    setInnerOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  function selectOption(nextValue: SortOption) {
    setInnerValue(nextValue);
    onValueChange?.(nextValue);
    setOpen(false);
  }

  return (
    <div className={cn('relative inline-flex flex-col items-end', className)} {...props}>
      <button
        type='button'
        aria-expanded={isOpen}
        onClick={() => setOpen(!isOpen)}
        className='label-medium text-text-secondary radius-full flex items-center gap-x1 py-x2 pl-x3'
      >
        {selectedLabel}
        <span className='flex size-5 items-center justify-center'>
          <ChevronDown className='text-text-secondary-inverse rotate-90' />
        </span>
      </button>
      {isOpen ? (
        <div className='radius-r2 bg-bg-0 border-line-200 absolute top-10 right-0 z-10 flex w-[111px] flex-col gap-x3 border border-solid p-x3'>
          {SORT_OPTIONS.map((option) => {
            const isSelected = option.value === selected;

            return (
              <button
                key={option.value}
                type='button'
                onClick={() => selectOption(option.value)}
                className={cn(
                  'text-left whitespace-nowrap',
                  isSelected ? 'body2-bold text-text-accent' : 'body2-regular text-text-secondary'
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export { SortDropdown };
export type { SortDropdownProps, SortOption };
