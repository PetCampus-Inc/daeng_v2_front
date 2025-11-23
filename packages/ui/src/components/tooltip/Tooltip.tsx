'use client';

import * as React from 'react';
import {
  TooltipRoot,
  TooltipTrigger as TooltipTriggerPrimitive,
  TooltipContent as TooltipContentPrimitive,
  useTooltipContext,
  type Placement,
} from '@daeng-design/react-tooltip';
import { cn } from '@knockdog/ui/lib';
import { Icon } from '../icon';

export type TooltipProps = React.ComponentProps<typeof TooltipRoot>;

export function Tooltip(props: TooltipProps) {
  return <TooltipRoot data-slot='tooltip' {...props} />;
}

export type TooltipTriggerProps = React.ComponentProps<typeof TooltipTriggerPrimitive>;

export function TooltipTrigger({ children, className, ...props }: TooltipTriggerProps) {
  return (
    <TooltipTriggerPrimitive data-slot='tooltip-trigger' className={cn('group', className)} {...props}>
      {children || (
        <>
          <Icon className='group-data-[state=closed]:hidden' icon={'TooltipFill'} />
          <Icon className='group-data-[state=open]:hidden' icon={'TooltipLine'} />
        </>
      )}
    </TooltipTriggerPrimitive>
  );
}

export type TooltipContentProps = React.ComponentProps<typeof TooltipContentPrimitive> & {
  motionClassName?: string;
};

export function TooltipContent({
  className,
  motionClassName = 'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
  ...props
}: TooltipContentProps) {
  const { placement } = useTooltipContext();

  const placementRadiusClasses: Record<Placement, string> = {
    'top-right': 'rounded-bl-none',
    'top-left': 'rounded-br-none',
    'bottom-left': 'rounded-tr-none',
    'bottom-right': 'rounded-tl-none',
  };

  return (
    <TooltipContentPrimitive
      data-slot='tooltip-content'
      className={cn(
        'bg-fill-secondary-700 text-text-primary-inverse body1-regular z-[1000] rounded-md px-3 py-1.5 shadow-lg',
        placementRadiusClasses[placement as Placement],
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        motionClassName,
        className
      )}
      {...props}
    />
  );
}
