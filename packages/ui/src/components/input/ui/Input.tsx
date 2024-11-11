'use client';

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

import { cn } from '@knockdog/ui/lib';

import {
  useInputFormatter,
  type TextInputFormat,
} from '../hooks/useInputFormatter';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  format?: TextInputFormat;
  suffixElement?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      value,
      maxLength,
      disabled,
      format = 'text',
      suffixElement,
      ...props
    },
    ref
  ) => {
    const { handleInput } = useInputFormatter({ value, format });

    return (
      <div
        className={cn(
          'border-gray4 focus-within:border-brown2 flex h-12 items-center rounded-md border pl-4 transition-colors ease-in-out',
          className,
          disabled && 'bg-gray5'
        )}
      >
        <input
          ref={ref}
          className='focus:text-primary typo-body-16 text-gray1 disabled:text-gray3 placeholder:text-gray4 flex-1 bg-transparent outline-none'
          autoComplete='off'
          maxLength={maxLength}
          disabled={disabled}
          value={value}
          onInput={handleInput}
          {...props}
        />

        <div className='mx-1 flex items-center'>{suffixElement}</div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
