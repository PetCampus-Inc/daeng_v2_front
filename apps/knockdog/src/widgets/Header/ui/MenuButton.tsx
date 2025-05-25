import { ComponentProps } from 'react';
import { Icon } from '@knockdog/ui';
function MenuButton({ children, ...props }: ComponentProps<'button'>) {
  return (
    <button className='size-6' {...props}>
      {children ?? <Icon icon='More' />}
    </button>
  );
}

export default MenuButton;
