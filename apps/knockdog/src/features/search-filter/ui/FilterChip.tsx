import { cva, type VariantProps } from 'class-variance-authority';

const filterChipVariants = cva(
  'body2-semibold radius-r2 py-x2 px-x3_5 border-line-200 flex items-center whitespace-nowrap border-[1.4] transition-colors',
  {
    variants: {
      activated: {
        true: 'bg-fill-secondary-700 text-neutral-100',
        false: 'bg-fill-secondary-0 text-text-primary',
      },
    },
  }
);

interface FilterChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof filterChipVariants> {
  activated?: boolean;
}

export function FilterChip({ activated, children, ...props }: FilterChipProps) {
  return (
    <button className={filterChipVariants({ activated })} {...props}>
      {children}
    </button>
  );
}
