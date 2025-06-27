'use client';

import { Slot } from '@radix-ui/react-slot';
import { Icon, type IconType } from '../icon';
import { cn } from '@knockdog/ui/lib';
import { cva, type VariantProps } from 'class-variance-authority';

const floatingActionButtonVariants = cva(
  'radius-full shadow-black/16 body2-semibold relative inline-flex items-center justify-center overflow-hidden shadow-[0_0_4px_0] transition-all',
  {
    variants: {
      variant: {
        primarySolid:
          'bg-fill-primary-500 text-text-primary-inverse active:bg-fill-primary-700',
        neutralSolid:
          'bg-fill-secondary-700 text-text-primary-inverse active:bg-fill-secondary-400',
        neutralLight:
          'bg-fill-secondary-0 text-text-primary active:bg-fill-secondary-100',
      },
      extended: {
        true: 'px-x3.5 w-fit',
        false: '',
      },
      size: {
        small: 'h-[40px]',
        medium: 'h-[48px]',
      },
    },
    compoundVariants: [
      {
        extended: true,
        size: 'small',
        className: 'h-[40px]',
      },
      {
        extended: true,
        size: 'medium',
        className: 'h-[48px]',
      },
      {
        extended: false,
        size: 'small',
        className: 'h-[40px] w-[40px]',
      },
      {
        extended: false,
        size: 'medium',
        className: 'h-[48px] w-[48px]',
      },
    ],
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
        true: 'mr-x1 size-x5',
        false:
          'size-x6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
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
