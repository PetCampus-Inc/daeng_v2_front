import { ComponentProps } from 'react';
import { Icon } from '@knockdog/ui';
import { useHeaderContext } from '../model/HeaderProvider';
import { cn } from '@knockdog/ui/lib';

function MenuButton({ children, ...props }: ComponentProps<'button'>) {
  const { textColor } = useHeaderContext();

  return (
    <button className={cn('size-6', textColor)} {...props}>
      {children ?? <Icon icon='More' />}
    </button>
  );
}

export default MenuButton;
