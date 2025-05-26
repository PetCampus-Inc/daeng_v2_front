import { ComponentProps } from 'react';
import { cn } from '@knockdog/ui/lib';

function Title({
  children,
  position = 'center',
  className,
  ...props
}: ComponentProps<'span'> & { position?: 'left' | 'center' | 'right' }) {
  return (
    <span
      className={cn(
        'text-[16px] font-bold',
        {
          'mx-auto': position === 'center',
          'ml-auto': position === 'right',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Title;
