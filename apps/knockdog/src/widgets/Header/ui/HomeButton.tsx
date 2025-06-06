import { ComponentProps } from 'react';
import { Icon } from '@knockdog/ui';

function HomeButton({ children, ...props }: ComponentProps<'button'>) {
  return (
    <button className='size-6' {...props}>
      {children ?? <Icon icon='Home' />}
    </button>
  );
}

export default HomeButton;
