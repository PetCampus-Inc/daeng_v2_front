import { ComponentProps } from 'react';
import { cn } from '@knockdog/ui/lib';
import { useHeaderContext } from '@widgets/Header/model/HeaderProvider';

function Title({
  children,
  position = 'center',
  className,
  ...props
}: ComponentProps<'span'> & { position?: 'left' | 'center' | 'right' }) {
  const { textColor } = useHeaderContext();

  return (
    <span
      className={cn(
        'text-[16px] font-bold',
        {
          'mx-auto': position === 'center',
          'ml-auto': position === 'right',
        },
        textColor,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Title;
