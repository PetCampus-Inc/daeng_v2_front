import { cva, type VariantProps } from 'class-variance-authority';

const serviceBadgeVariants = cva(
  'caption1-semibold px-x2 py-x1 gap-x1 inline-flex items-center justify-center rounded-full border',
  {
    variants: {
      variant: {
        solid:
          'bg-fill-secondary-700 text-text-primary-inverse [&>svg]:text-fill-secondary-100 border-transparent',
        outline: 'bg-fill-secondary-0 text-text-secondary border-line-200',
      },
    },
  }
);

interface ServiceBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof serviceBadgeVariants> {}

export function ServiceBadge({
  variant,
  children,
  ...props
}: ServiceBadgeProps) {
  return (
    <div className={serviceBadgeVariants({ variant })} {...props}>
      {children}
    </div>
  );
}
