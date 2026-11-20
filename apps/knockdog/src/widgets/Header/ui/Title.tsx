import { ComponentProps } from 'react';
import { cn } from '@knockdog/ui/lib';
import { useHeaderContext } from '../model/HeaderProvider';

function Title({ children, center = false, className, ...props }: ComponentProps<'span'> & { center?: boolean }) {
  const { textColor } = useHeaderContext();

  return (
    <span
      className={cn(
        'h3-extrabold text-text-primary min-w-0',
        textColor,
        center ? 'absolute left-1/2 -translate-x-1/2' : 'flex-1 truncate text-left',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Title;
