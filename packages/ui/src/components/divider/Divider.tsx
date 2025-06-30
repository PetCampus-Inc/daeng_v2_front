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
  },
  defaultVariants: {
    variant: 'solid',
    orientation: 'horizontal',
  },
});

const sizeClasses = {
  normal: {
    horizontal: 'border-t-1 border-line-200',
    vertical: 'border-l-1 border-line-200',
  },
  thick: {
    horizontal: 'border-t-8 border-line-100',
    vertical: 'border-l-8 border-line-100',
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
      size = 'normal',
      ...props
    },
    ref
  ) => {
    const sizeClass = sizeClasses[size]?.[orientation || 'horizontal'];

    return (
      <div
        role='separator'
        aria-orientation={orientation ?? 'horizontal'}
        className={cn(
          dividerVariants({
            variant,
            orientation,
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
