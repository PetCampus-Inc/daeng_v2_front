import { type ComponentProps } from 'react';

import { cn } from '@knockdog/ui/lib';

type DurationUnit = 'day' | 'month';

interface DurationUnitFieldProps extends Omit<ComponentProps<'input'>, 'type'> {
  unit: DurationUnit;
  onUnitChange?: (unit: DurationUnit) => void;
}

const UNITS = [
  { value: 'day', label: '일' },
  { value: 'month', label: '개월' },
] as const;

/** V4 / Input / Duration Unit */
function DurationUnitField({ unit, onUnitChange, className, ...props }: DurationUnitFieldProps) {
  return (
    <div className={cn('flex w-full items-center gap-x2', className)}>
      <div className='radius-r3 bg-bg-0 border-line-200 flex min-w-0 flex-1 items-center border border-solid py-x4 pr-x3 pl-x4'>
        <input
          type='text'
          inputMode='numeric'
          className='body1-medium text-text-primary placeholder:text-text-secondary-inverse w-full bg-transparent px-x1 outline-none'
          {...props}
        />
      </div>
      <div className='bg-fill-secondary-100 radius-r3 flex h-[52px] w-[150px] shrink-0 gap-x1 p-x1'>
        {UNITS.map((item) => {
          const isSelected = unit === item.value;

          return (
            <button
              key={item.value}
              type='button'
              onClick={() => onUnitChange?.(item.value)}
              className={cn(
                'body1-medium radius-r2 flex flex-1 items-center justify-center',
                isSelected ? 'bg-bg-0 text-text-primary' : 'text-fill-secondary-500'
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { DurationUnitField };
export type { DurationUnit, DurationUnitFieldProps };
