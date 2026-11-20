import { type ComponentProps, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@knockdog/ui/lib';

const numberFieldBoxVariants = cva('radius-r3 flex w-full items-center border border-solid py-x4 pr-x3 pl-x4', {
  variants: {
    state: {
      default: 'bg-bg-0 border-line-200',
      filled: 'bg-bg-0 border-line-200',
      error: 'bg-bg-0 border-error',
    },
  },
  defaultVariants: {
    state: 'default',
  },
});

type NumberFieldState = 'default' | 'filled' | 'error';

interface NumberFieldProps extends Omit<ComponentProps<'input'>, 'size'>, VariantProps<typeof numberFieldBoxVariants> {
  unit?: ReactNode;
  errorMessage?: ReactNode;
  state?: NumberFieldState;
}

/** V4 / Input / Number Field */
function NumberField({ unit = '마리', errorMessage, state = 'default', className, ...props }: NumberFieldProps) {
  const isMuted = state === 'default';

  return (
    <div className={cn('flex w-full flex-col gap-x2', className)}>
      <div className={numberFieldBoxVariants({ state })}>
        <div className='flex min-w-0 flex-1 items-center justify-between px-x1'>
          <input
            inputMode='numeric'
            className={cn(
              'body1-medium placeholder:text-text-secondary-inverse min-w-0 flex-1 bg-transparent outline-none',
              isMuted ? 'text-text-secondary-inverse' : 'text-text-primary'
            )}
            {...props}
          />
          <span className='body2-regular text-text-secondary shrink-0'>{unit}</span>
        </div>
      </div>
      {state === 'error' && errorMessage ? (
        <p className='caption1-regular text-error px-x2 whitespace-nowrap'>{errorMessage}</p>
      ) : null}
    </div>
  );
}

export { NumberField };
export type { NumberFieldProps, NumberFieldState };
