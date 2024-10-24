'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

import { cn } from '@knockdog/ui/lib';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  onComplete?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, value, maxLength, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'border-gray4 disabled:bg-gray5 disabled:text-gray3 placeholder:text-gray4 typo-body-16 text-gray1 focus:border-brown2 focus:text-primary h-12 rounded-md border px-4 outline-none transition-colors ease-in-out',
          className
        )}
        autoComplete='off'
        maxLength={maxLength}
        data-has-value={!!value}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
