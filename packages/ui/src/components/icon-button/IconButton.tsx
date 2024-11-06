'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@knockdog/ui/lib';
import { Icon, IconType } from '../icon';

const iconButtonVariants = cva(
  'inline-flex items-center justify-center bg-transparent rounded-md',
  {
    variants: {
      size: {
        sm: 'size-7',
        md: 'size-8',
        lg: 'size-9',
      },
      pressEffect: {
        true: 'active:bg-gray5 active:scale-95 active:opacity-90 transition-all ease-in-out duration-200',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: IconType;
  iconClassName?: string;
  asChild?: boolean;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      iconClassName,
      size,
      icon,
      pressEffect,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(iconButtonVariants({ size, pressEffect, className }))}
        ref={ref}
        {...props}
      >
        <Icon className={iconClassName} icon={icon} />
      </Comp>
    );
  }
);
IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };
