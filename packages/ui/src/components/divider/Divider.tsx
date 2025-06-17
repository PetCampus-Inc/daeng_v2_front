import { cn } from '@knockdog/ui/lib';
import { VariantProps, cva } from 'class-variance-authority';
import { forwardRef } from 'react';

const dividerVariants = cva('', {
  variants: {
    variant: {
      solid: '',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
    },
    orientation: {
      horizontal: 'w-full border-t',
      vertical: 'h-full border-l',
    },
    dividerColor: {
      default: 'border-line-200',
      subtle: 'border-line-100',
      accent: 'border-line-accent',
    },
  },
  defaultVariants: {
    variant: 'solid',
    orientation: 'horizontal',
    dividerColor: 'default',
  },
});

const sizeClasses = {
  xs: {
    horizontal: 'border-t-1',
    vertical: 'border-l-1',
  },
  sm: {
    horizontal: 'border-t-4',
    vertical: 'border-l-4',
  },
  md: {
    horizontal: 'border-t-8',
    vertical: 'border-l-8',
  },
  lg: {
    horizontal: 'border-t-16',
    vertical: 'border-l-16',
  },
  xl: {
    horizontal: 'border-t-32',
    vertical: 'border-l-32',
  },
} as const;

export interface DividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {
  size?: keyof typeof sizeClasses;
}

const Divider = forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      className,
      variant,
      orientation = 'horizontal',
      size = 'md',
      dividerColor,
      ...props
    },
    ref
  ) => {
    const sizeClass = sizeClasses[size]?.[orientation || 'horizontal'];

    return (
      <div
        className={cn(
          dividerVariants({
            variant,
            orientation,
            dividerColor,
          }),
          sizeClass,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

export { Divider, dividerVariants };
