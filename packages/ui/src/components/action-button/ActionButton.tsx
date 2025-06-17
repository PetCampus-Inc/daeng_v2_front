'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

const actionButtonVariants = cva(
  'ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center whitespace-nowrap border-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primaryFill:
          'bg-fill-primary-500 text-text-primary-inverse active:bg-fill-primary-700 data-[active]:bg-fill-primary-700 disabled:bg-fill-secondary-100 data-[disabled]:bg-fill-secondary-100 disabled:text-text-secondary-inverse data-[disabled]:text-text-secondary-inverse',
        primaryLine:
          'bg-primitive-neutral-0 text-text-accent border-line-accent active:bg-primitive-orange-100 data-[active]:bg-primitive-orange-100 disabled:border-line-400 data-[disabled]:border-line-400 disabled:text-text-secondary-inverse data-[disabled]:text-text-secondary-inverse border border-solid',
        secondaryFill:
          'bg-fill-secondary-700 text-text-primary-inverse active:bg-fill-secondary-400 data-[active]:bg-fill-secondary-400 disabled:bg-fill-secondary-100 data-[disabled]:bg-fill-secondary-100 disabled:text-text-secondary-inverse data-[disabled]:text-text-secondary-inverse',
        secondaryLine:
          'bg-fill-secondary-0 text-text-secondary border-line-400 active:bg-fill-secondary-100 data-[active]:bg-fill-secondary-100 disabled:text-text-secondary-inverse data-[disabled]:text-text-secondary-inverse border border-solid',
        tertiaryFill:
          'bg-fill-secondary-100 text-text-primary active:bg-fill-secondary-200 data-[active]:bg-fill-secondary-200 disabled:text-text-tertiary data-[disabled]:text-text-tertiary',
      },
      size: {
        small: 'radius-r2 h-x7_5 caption1-semibold py-x2 px-x3 gap-x1',
        medium: 'h-x12 radius-r2 body2-bold py-x3.5 px-x4 gap-x1',
        large: 'h-x14 radius-r2 body1-bold p-x4 gap-x1',
      },
    },
    defaultVariants: {
      variant: 'primaryFill',
      size: 'medium',
    },
  }
);

interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof actionButtonVariants> {
  ref?: React.Ref<HTMLButtonElement>;
  asChild?: boolean;
}

const ActionButton = ({ ref, ...props }: ActionButtonProps) => {
  const { asChild, variant, size, className, children, ...restProps } = props;
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      className={actionButtonVariants({ variant, size, className })}
      {...restProps}
    >
      {children}
    </Comp>
  );
};
ActionButton.displayName = 'ActionButton';

export { ActionButton, type ActionButtonProps };
