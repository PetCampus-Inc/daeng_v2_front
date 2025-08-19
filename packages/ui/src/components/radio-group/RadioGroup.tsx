'use client';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@knockdog/ui/lib';
import { useId } from 'react';

export interface RadioGroupProps extends RadioGroupPrimitive.RadioGroupProps {
  children: React.ReactNode;
  className?: string;
}

export interface RadioGroupItemProps extends RadioGroupPrimitive.RadioGroupItemProps {
  className?: string;
  children?: React.ReactNode;
  readOnly?: boolean;
}

const RadioGroup = ({ children, className, ...props }: RadioGroupProps) => {
  return (
    <RadioGroupPrimitive.Root className={cn('flex flex-col gap-2', className)} {...props}>
      {children}
    </RadioGroupPrimitive.Root>
  );
};

const RadioGroupItem = ({ children, className, id, ...props }: RadioGroupItemProps) => {
  const generatedId = useId();
  const itemId = id || generatedId;

  return (
    <div className='flex items-center space-x-2'>
      <RadioGroupPrimitive.Item
        id={itemId}
        className={cn(
          'border-line-400 aspect-square h-5 w-5 rounded-full border',
          'focus:outline-none',
          'data-[state=checked]:border-fill-primary-500 data-[state=checked]:bg-fill-secondary-0',
          'disabled:bg-fill-secondary-100 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className='flex items-center justify-center'>
          <div className={cn('bg-fill-primary-500 h-3 w-3 rounded-full')} />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      {children && (
        <label
          htmlFor={itemId}
          className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
        >
          {children}
        </label>
      )}
    </div>
  );
};

export { RadioGroup, RadioGroupItem };
