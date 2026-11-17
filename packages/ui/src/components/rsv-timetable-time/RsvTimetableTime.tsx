import { type ComponentProps, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@knockdog/ui/lib';

const rsvTimetableTimeVariants = cva(
  'radius-r2 inline-flex h-x10 w-full items-center justify-center gap-x1_5 p-x2_5 disabled:opacity-100',
  {
    variants: {
      state: {
        default: 'caption1-semibold border-line-200 bg-bg-0 text-text-primary border border-solid',
        disabled: 'caption1-semibold bg-bg-50 text-text-caption',
        selected: 'caption1-extrabold border-line-accent bg-fill-primary-50 text-text-primary border border-solid',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

type RsvTimetableTimeState = 'default' | 'disabled' | 'selected';

interface RsvTimetableTimeProps
  extends Omit<ComponentProps<'button'>, 'children'>,
    VariantProps<typeof rsvTimetableTimeVariants> {
  state?: RsvTimetableTimeState;
  isReserved?: boolean;
  children?: ReactNode;
}

/** V4 / Reservation / Timetable Time */
function RsvTimetableTime({
  state = 'default',
  isReserved = false,
  children = '00:00',
  className,
  type = 'button',
  disabled,
  ...props
}: RsvTimetableTimeProps) {
  const isDisabled = disabled ?? state === 'disabled';

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-pressed={state === 'selected'}
      className={cn(rsvTimetableTimeVariants({ state }), className)}
      {...props}
    >
      {isReserved ? <span className='bg-fill-primary-500 size-x1_5 shrink-0 rounded-full' /> : null}
      {children}
    </button>
  );
}

export { RsvTimetableTime, rsvTimetableTimeVariants };
export type { RsvTimetableTimeProps, RsvTimetableTimeState };
