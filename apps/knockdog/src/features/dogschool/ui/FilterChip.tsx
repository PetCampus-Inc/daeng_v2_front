import { cva, type VariantProps } from 'class-variance-authority';

const filterChipVariants = cva(
  'body2-semibold flex items-center whitespace-nowrap transition-colors',
  {
    variants: {
      variant: {
        toggle: 'radius-r2 py-x2 px-x3_5 border-line-200 border-[1.4]',
        status: 'py-x2 px-x2 gap-x0_5',
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
        class: 'text-text-primary [&>svg]:text-fill-primary-500',
      },
      {
        variant: 'status',
        activated: false,
        class: 'text-text-primary [&>svg]:text-fill-secondary-400',
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
  ...props
}: FilterChipProps) {
  return (
    <button className={filterChipVariants({ variant, activated })} {...props}>
      {variant === 'status' && (
        <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
          <rect x='3' y='3' width='10' height='10' rx='5' fill='currentColor' />
        </svg>
      )}
      {children}
    </button>
  );
}
