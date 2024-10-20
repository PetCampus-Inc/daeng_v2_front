'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@knockdog/ui/lib';

const buttonVariants = cva('border border-transparent', {
  variants: {
    variant: {
      default: 'bg-gray4 text-gray2',
      primary: 'bg-primary text-white',
      secondary: 'bg-brown4 text-primary border-brown3',
    },
    size: {
      sm: 'typo-label-14-m h-7 px-2 rounded-sm',
      md: 'typo-label-14-m h-10 px-4 rounded-md',
      lg: 'typo-body-16 h-12 px-5 rounded-md',
    },
    rounded: {
      true: 'rounded-full',
    },
  },
  defaultVariants: {
    variant: 'primary',
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
  ({ className, variant, size, rounded, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <>
        <Comp
          className={cn(buttonVariants({ variant, size, rounded, className }))}
          ref={ref}
          {...props}
        />
      </>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
