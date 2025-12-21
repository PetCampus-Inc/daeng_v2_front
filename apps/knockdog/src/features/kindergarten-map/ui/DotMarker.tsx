import { cn } from '@knockdog/ui/lib';

export function DotMarker({ className }: { className?: string }) {
  return (
    <div className={cn('size-x2.5', className)}>
      <svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10' fill='none'>
        <circle cx='5' cy='5' r='4.2' fill='#F9F9FA' stroke='#15161B' strokeWidth='1.6' />
      </svg>
    </div>
  );
}
