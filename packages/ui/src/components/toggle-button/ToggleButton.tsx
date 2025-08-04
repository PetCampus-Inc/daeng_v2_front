import { Toggle as TogglePrimitive } from '@daeng-design/react-toggle';
import React from 'react';
import { cn } from '@knockdog/ui/lib';

type ToggleButtonProps = React.ComponentProps<typeof TogglePrimitive.Root>;

export const ToggleButton = React.forwardRef<
  HTMLButtonElement,
  ToggleButtonProps
>(({ className, ...restProps }, ref) => {
  return (
    <TogglePrimitive.Root
      ref={ref}
      className={cn(
        'bg-fill-secondary-50 body2-semibold data-[pressed]:text-text-primary-inverse data-[pressed]:bg-fill-secondary-700 inline-flex cursor-pointer items-center justify-center rounded-lg border-none p-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
        className
      )}
      {...restProps}
    />
  );
});
ToggleButton.displayName = 'ToggleButton';

export { type ToggleButtonProps };
