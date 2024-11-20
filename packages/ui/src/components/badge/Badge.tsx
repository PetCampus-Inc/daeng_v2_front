import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@knockdog/ui/lib';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center border px-2.5 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-brown4 bg-brown4 text-primary',
        primary: 'border-brown5 bg-brown5 text-primary',
        outline: 'border-primary bg-transparent text-primary',
        secondary: 'border-yellow3 bg-yellow3 text-primary',
        tertiary: 'border-gray5 bg-gray5 text-gray2',
        success: 'border-green bg-green text-white',
        destructive: 'border-red1 bg-red1 text-white',
      },
      shape: {
        square: 'rounded-md',
        rounded: 'rounded-lg',
      },
      size: {
        sm: 'px-2 py-1',
        md: 'px-2.5 py-1',
        lg: 'px-5 py-1.5',
      },
      bold: {
        true: 'font-bold',
      },
    },
    defaultVariants: {
      variant: 'default',
      shape: 'rounded',
      size: 'md',
      bold: false,
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = ({
  variant,
  shape,
  size,
  bold,
  className,
  ...restProps
}: BadgeProps) => {
  return (
    <div
      className={cn(badgeVariants({ variant, shape, size, bold }), className)}
      {...restProps}
    />
  );
};
export { Badge };
