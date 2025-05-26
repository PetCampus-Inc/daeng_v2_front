import { ComponentProps } from 'react';
import { Icon } from '@knockdog/ui';

function CloseButton({ children, ...props }: ComponentProps<'button'>) {
  return (
    <button className='size-6' {...props}>
      {children ?? <Icon icon='Close' />}
    </button>
  );
}

export default CloseButton;
