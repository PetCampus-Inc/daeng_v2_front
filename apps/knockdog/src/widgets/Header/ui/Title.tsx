import { ComponentProps } from 'react';
import { cn } from '@knockdog/ui/lib';
import { useHeaderContext } from '../model/HeaderProvider';

function Title({ children, center = true, className, ...props }: ComponentProps<'span'> & { center?: boolean }) {
  const { textColor } = useHeaderContext();

  return (
    <span className={cn('h3-extrabold text-text-primary', textColor, center && 'mx-auto', className)} {...props}>
      {children}
    </span>
  );
}

export default Title;
