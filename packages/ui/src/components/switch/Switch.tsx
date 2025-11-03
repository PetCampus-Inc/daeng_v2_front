import { Toggle as TogglePrimitive, useToggleContext } from '@daeng-design/react-toggle';
import React from 'react';
import { cn } from '@knockdog/ui/lib';

interface SwitchProps extends React.ComponentProps<typeof TogglePrimitive.Root> {}

const SwitchKnob = () => {
  const { pressed } = useToggleContext();
  return (
    <span
      className={cn(
        'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
        'translate-x-0.5 translate-y-0.5',
        pressed && 'translate-x-[22px]'
      )}
    />
  );
};

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(({ className, disabled, ...restProps }, ref) => {
  return (
    <TogglePrimitive.Root
      ref={ref}
      disabled={disabled}
      className={cn(
        'group bg-fill-secondary-400 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-none transition-colors',
        'data-[pressed]:bg-orange-500',
        'focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...restProps}
    >
      <SwitchKnob />
    </TogglePrimitive.Root>
  );
});
Switch.displayName = 'Switch';

export { type SwitchProps };
