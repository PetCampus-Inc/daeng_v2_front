'use client';

import { Slot } from '@radix-ui/react-slot';
import { Icon, type IconType } from '../icon';
import { cn } from '@knockdog/ui/lib';
import { cva, type VariantProps } from 'class-variance-authority';

const floatingActionButtonVariants = cva(
  'radius-full label-semibold relative inline-flex cursor-pointer items-center justify-center overflow-hidden shadow-[0_0_4px_0] shadow-black/16 transition-all',
  {
    variants: {
      variant: {
        primarySolid:
          'bg-fill-primary-500 text-text-primary-inverse active:bg-fill-primary-700',
        neutralSolid:
          'bg-primitive-neutral-800 text-text-primary-inverse active:bg-fill-secondary-400',
        neutralLight:
          'bg-fill-secondary-0 text-text-primary active:bg-fill-secondary-100 border-line-200 border',
      },
      extended: {
        true: 'px-x3.5 w-fix',
        false: 'max-w-[52px] min-w-[52px]',
      },
      size: {
        medium: 'h-[52px]',
      },
    },
    defaultVariants: {
      variant: 'primarySolid',
      size: 'medium',
    },
  }
);

const iconVariants = cva(
  'inline-flex flex-shrink-0 items-center justify-center text-inherit',
  {
    variants: {
      extended: {
        true: 'mr-x0_5 size-x6',
        false:
          'size-x6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      },
    },
  }
);

export interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof floatingActionButtonVariants> {
  ref?: React.Ref<HTMLButtonElement>;

  asChild?: boolean;

  extended?: boolean;

  label: React.ReactNode;

  icon?: IconType;
}

export function FloatingActionButton({
  ref,
  ...props
}: FloatingActionButtonProps) {
  const {
    asChild,
    variant,
    extended = true,
    size = 'medium',
    label,
    icon,
    className,
    ...restProps
  } = props;

  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      className={cn(
        floatingActionButtonVariants({
          variant,
          extended,
          size,
        }),
        className
      )}
      {...restProps}
    >
      {icon && <Icon icon={icon} className={iconVariants({ extended })} />}
      <span
        className={cn(
          'overflow-hidden whitespace-nowrap',
          !extended && 'opacity-0'
        )}
      >
        {label}
      </span>
    </Comp>
  );
}
FloatingActionButton.displayName = 'FloatingActionButton';
