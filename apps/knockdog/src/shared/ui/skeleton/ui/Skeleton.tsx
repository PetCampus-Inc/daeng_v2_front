import { cn } from '@knockdog/ui/lib';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='skeleton' className={cn('bg-fill-secondary-100 animate-pulse', className)} {...props} />;
}

export { Skeleton };
