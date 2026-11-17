import { type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

interface ImageAreaProps {
  children?: ReactNode;
  className?: string;
}

/** V4 / Image Area */
function ImageArea({ children, className }: ImageAreaProps) {
  return (
    <div className={cn('border-line-200 radius-r4 relative overflow-hidden border border-solid', className)}>
      {children}
      <div className='bg-primitive-neutral-1000/20 pointer-events-none absolute inset-0' />
    </div>
  );
}

export { ImageArea };
export type { ImageAreaProps };
