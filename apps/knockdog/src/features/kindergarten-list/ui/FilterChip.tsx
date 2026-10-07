import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@knockdog/ui/lib';

const filterChipVariants = cva(
  'body2-semibold flex items-center whitespace-nowrap transition-colors',
  {
    variants: {
      variant: {
        toggle: 'box-border h-[38px] gap-x1 radius-r2 border-line-200 border-[1.4px] border-solid px-[14px] py-[9px]',
        status: 'box-border h-x9 gap-x0_5 radius-full border-[1.4px] border-solid px-x3 py-x2',
      },
      activated: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'toggle',
        activated: true,
        class: 'bg-fill-secondary-700 text-text-primary-inverse',
      },
      {
        variant: 'toggle',
        activated: false,
        class: 'bg-fill-secondary-0 text-text-primary',
      },
      {
        variant: 'status',
        activated: true,
        class: 'bg-fill-primary-50 border-line-accent text-text-accent',
      },
      {
        variant: 'status',
        activated: false,
        class: 'bg-fill-secondary-0 border-line-200 text-text-primary',
      },
    ],
  }
);

interface FilterChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof filterChipVariants> {
  activated?: boolean;
}

export function FilterChip({
  variant = 'toggle',
  activated = false,
  children,
  className,
  ...props
}: FilterChipProps) {
  return (
    <button className={cn(filterChipVariants({ variant, activated }), className)} {...props}>
      {children}
    </button>
  );
}
