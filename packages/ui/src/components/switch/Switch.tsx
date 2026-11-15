import { Toggle as TogglePrimitive, useToggleContext } from '@daeng-design/react-toggle';
import React from 'react';
import { cn } from '@knockdog/ui/lib';

type SwitchSize = 'md' | 'sm';

interface SwitchProps extends React.ComponentProps<typeof TogglePrimitive.Root> {
  /** 스위치 크기. `md`는 44x24(기본), `sm`은 32x18 */
  size?: SwitchSize;
}

const trackSizeClassNames: Record<SwitchSize, string> = {
  md: 'h-6 w-11',
  sm: 'h-[18px] w-8',
};

const knobSizeClassNames: Record<SwitchSize, string> = {
  md: 'h-5 w-5 translate-x-0.5 translate-y-0.5',
  sm: 'h-3.5 w-3.5 translate-x-0.5 translate-y-0.5',
};

const knobPressedClassNames: Record<SwitchSize, string> = {
  md: 'translate-x-[22px]',
  sm: 'translate-x-4',
};

/** 스위치 손잡이. 눌린 상태이면 오른쪽으로 이동한다. */
const SwitchKnob = ({ size }: { size: SwitchSize }) => {
  const { pressed } = useToggleContext();
  return (
    <span
      className={cn(
        'pointer-events-none block rounded-full bg-white shadow-sm transition-transform',
        knobSizeClassNames[size],
        pressed && knobPressedClassNames[size]
      )}
    />
  );
};

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, disabled, size = 'md', ...restProps }, ref) => {
    return (
      <TogglePrimitive.Root
        ref={ref}
        disabled={disabled}
        className={cn(
          'group bg-fill-secondary-400 relative inline-flex shrink-0 cursor-pointer rounded-full border-none transition-colors',
          trackSizeClassNames[size],
          'data-[pressed]:bg-orange-500',
          'focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...restProps}
      >
        <SwitchKnob size={size} />
      </TogglePrimitive.Root>
    );
  }
);
Switch.displayName = 'Switch';

export { type SwitchProps };
