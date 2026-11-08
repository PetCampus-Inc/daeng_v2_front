import { type ComponentProps, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@knockdog/ui/lib';

const RSV_DAY_STATUS = {
  empty: 'empty',
  unselectable: 'unselectable',
  selectable: 'selectable',
  today: 'today',
  selected: 'selected',
  reserved: 'reserved',
  todaySelected: 'todaySelected',
  reservedSelected: 'reservedSelected',
} as const;

type RsvDayStatusKind = keyof typeof RSV_DAY_STATUS;

const rsvDayStatusVariants = cva('inline-flex w-x8 min-h-[42px] flex-col items-center px-x0_5 py-x1', {
  variants: {
    status: {
      empty: 'h-[42px]',
      unselectable: 'gap-x0_5',
      selectable: 'gap-x0_5',
      today: 'gap-x0_5',
      selected: 'radius-r2 bg-fill-primary-500 gap-x0_5',
      reserved: 'h-[42px] gap-x1',
      todaySelected: 'radius-r2 bg-fill-primary-500 gap-x0_5',
      reservedSelected: 'radius-r2 bg-fill-primary-500 gap-x0_5',
    },
  },
  defaultVariants: {
    status: 'today',
  },
});

const DAY_NUMBER_CLASS = {
  unselectable: 'label-medium text-text-caption',
  selectable: 'label-medium text-text-primary',
  today: 'label-medium text-text-primary',
  selected: 'label-medium text-text-primary-inverse',
  reserved: 'label-medium text-text-primary',
  todaySelected: 'label-medium text-text-primary-inverse',
  reservedSelected: 'label-medium text-text-primary-inverse',
} as const;

interface RsvDayStatusProps
  extends Omit<ComponentProps<'button'>, 'children'>,
    VariantProps<typeof rsvDayStatusVariants> {
  status?: RsvDayStatusKind;
  children?: ReactNode;
}

/** V4 / Reservation / Day Status */
function RsvDayStatus({
  status = 'today',
  children = '1',
  className,
  type = 'button',
  disabled,
  ...props
}: RsvDayStatusProps) {
  if (status === 'empty') {
    return <span className={cn(rsvDayStatusVariants({ status }), className)} />;
  }

  const isSelected = status === 'selected' || status === 'todaySelected' || status === 'reservedSelected';
  const isToday = status === 'today' || status === 'todaySelected';
  const isReserved = status === 'reserved' || status === 'reservedSelected';

  return (
    <button
      type={type}
      disabled={disabled ?? status === 'unselectable'}
      aria-pressed={isSelected}
      className={cn(rsvDayStatusVariants({ status }), 'disabled:opacity-100', className)}
      {...props}
    >
      <span className={DAY_NUMBER_CLASS[status]}>{children}</span>
      {isToday ? (
        <span className={cn('caption2-medium', isSelected ? 'text-text-primary-inverse' : 'text-text-primary')}>오늘</span>
      ) : null}
      {isReserved ? (
        <span
          className={cn(
            'size-x1_5 shrink-0 rounded-full',
            status === 'reservedSelected' ? 'bg-text-primary-inverse' : 'bg-fill-primary-500'
          )}
        />
      ) : null}
    </button>
  );
}

export { RsvDayStatus, RSV_DAY_STATUS, rsvDayStatusVariants };
export type { RsvDayStatusKind, RsvDayStatusProps };
