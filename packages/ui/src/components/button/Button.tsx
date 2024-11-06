'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@knockdog/ui/lib';

const buttonVariants = cva('', {
  variants: {
    colorScheme: {
      default: 'bg-gray4 text-gray2 border-gray3',
      primary: 'bg-primary text-white border-transparent',
      secondary: 'bg-brown4 text-primary border-brown3',
      tertiary: 'bg-yellow3 text-primary border-yellow2',
      destructive: 'bg-red1 text-white border-transparent',
    },
    variant: {
      fill: 'disabled:bg-gray5 disabled:text-gray3 disabled:border-transparent',
      outline:
        'border disabled:bg-gray5 disabled:text-gray3 disabled:border-gray4',
    },
    size: {
      sm: 'typo-label-14-m h-7 px-3 rounded-sm',
      md: 'typo-label-14-m h-10 px-5 rounded-md',
      lg: 'typo-body-16-b h-12 px-6 rounded-md',
    },
    rounded: {
      true: 'rounded-full',
    },
  },
  defaultVariants: {
    variant: 'fill',
    colorScheme: 'primary',
    size: 'lg',
    rounded: false,
  },
});

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      colorScheme,
      size,
      rounded,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, colorScheme, size, rounded, className })
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
