'use client';

import * as React from 'react';
import { SegmentedControl as SegmentedControlPrimitive } from '@daeng-design/react-segmented-control';
import { cn } from '@knockdog/ui/lib';

interface SegmentedControlRootProps
  extends SegmentedControlPrimitive.RootProps {}

interface SegmentedControlItemProps
  extends SegmentedControlPrimitive.ItemProps {}

const SegmentedControlRoot = React.forwardRef<
  HTMLDivElement,
  SegmentedControlRootProps
>(({ className, children, ...props }, ref) => (
  <SegmentedControlPrimitive.Root
    ref={ref}
    className={cn(
      'bg-fill-secondary-100 radius-full p-x1 gap-x1 relative isolate grid w-full max-w-full auto-cols-fr grid-flow-col items-center',
      className
    )}
    {...props}
  >
    {children}
    <SegmentedControlPrimitive.Indicator className='radius-full bg-fill-secondary-700 -z-1 absolute h-[var(--height)] w-[var(--width)] shadow' />
  </SegmentedControlPrimitive.Root>
));
SegmentedControlRoot.displayName = 'SegmentedControl';

const SegmentedControlItem = React.forwardRef<
  HTMLLabelElement,
  SegmentedControlItemProps
>(({ className, children, ...props }, ref) => (
  <SegmentedControlPrimitive.Item
    ref={ref}
    className={cn(
      'radius-full body2-semibold text-text-tertiary flex min-h-[var(--dimension-x9)] min-w-[86px] flex-1 cursor-pointer select-none items-center justify-center px-3 text-center transition-all',
      'data-[state=checked]:text-text-primary-inverse data-[state=checked]:font-bold',
      className
    )}
    {...props}
  >
    <span className='truncate px-1'>{children}</span>
    <SegmentedControlPrimitive.HiddenInput />
  </SegmentedControlPrimitive.Item>
));
SegmentedControlItem.displayName = 'SegmentedControlItem';

export { SegmentedControlRoot, SegmentedControlItem };
export type { SegmentedControlRootProps, SegmentedControlItemProps };
