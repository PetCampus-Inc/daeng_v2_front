'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Icon } from '../../icon';

import { cn } from '@knockdog/ui/lib';

const Select = SelectPrimitive.Root;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, disabled, children, ...restProps }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'data-[state=open]:border-brown2 data-[state=open]:text-brown2 disabled:border-gray2 disabled:text-gray2 border-darkBlack text-darkBlack flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border px-3 py-2 outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      className
    )}
    {...restProps}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <Icon icon='Alldogs' className={cn(disabled ? 'text-gray2' : '')} />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'data-[state=open]:border-brown2 data-[side=top]:slide-in-from-bottom-2 data-[side=right]:slide-in-from-left-2 data-[side=left]:slide-in-from-right-2 data-[side=bottom]:slide-in-from-top-2 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-white shadow-md',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'data-[state=checked]:bg-gray4 focus:bg-gray4 relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem };
