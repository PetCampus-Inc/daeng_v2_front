import { type ComponentProps, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@knockdog/ui/lib';

const formFieldBoxVariants = cva('radius-r3 flex w-full items-center border border-solid py-x4 pr-x3 pl-x4', {
  variants: {
    state: {
      default: 'bg-bg-0 border-line-200',
      filled: 'bg-bg-0 border-line-200',
      error: 'bg-bg-0 border-error',
      locked: 'bg-bg-50 border-line-200',
    },
  },
  defaultVariants: {
    state: 'default',
  },
});

type FormFieldState = 'default' | 'filled' | 'error' | 'locked';
type FormFieldTrailingSize = 'caption' | 'body';

interface FormFieldProps
  extends Omit<ComponentProps<'input'>, 'size'>,
    VariantProps<typeof formFieldBoxVariants> {
  label?: ReactNode;
  trailing?: ReactNode;
  trailingSize?: FormFieldTrailingSize;
  errorMessage?: ReactNode;
  state?: FormFieldState;
}

/** V4 / Input / Form Field */
function FormField({
  label,
  trailing,
  trailingSize = 'caption',
  errorMessage,
  state = 'default',
  className,
  disabled,
  ...props
}: FormFieldProps) {
  const isLocked = state === 'locked';

  return (
    <div className={cn('flex w-full flex-col gap-x4', className)}>
      {label ? <p className='label-medium text-text-secondary px-x1'>{label}</p> : null}
      <div className='flex flex-col gap-x2'>
        <div className={formFieldBoxVariants({ state })}>
          <div className='flex min-w-0 flex-1 items-center justify-between px-x1'>
            <input
              disabled={disabled || isLocked}
              className={cn(
                'body1-medium placeholder:text-text-secondary-inverse min-w-0 flex-1 bg-transparent outline-none',
                isLocked ? 'text-text-secondary-inverse' : 'text-text-primary'
              )}
              {...props}
            />
            {trailing ? (
              <span
                className={cn(
                  'text-fill-secondary-500 shrink-0',
                  trailingSize === 'body' ? 'body2-regular' : 'caption1-regular'
                )}
              >
                {trailing}
              </span>
            ) : null}
          </div>
        </div>
        {state === 'error' && errorMessage ? (
          <p className='caption1-regular text-error px-x2 whitespace-nowrap'>{errorMessage}</p>
        ) : null}
      </div>
    </div>
  );
}

export { FormField };
export type { FormFieldProps, FormFieldState };
