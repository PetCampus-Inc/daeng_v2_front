import { ComponentProps } from 'react';
import { Icon } from '@knockdog/ui';

type ShareButtonProps = ComponentProps<'button'> & {
  children?: string;
};

function ShareButton({ children, ...props }: ShareButtonProps) {
  return (
    <button className='size-6' {...props}>
      {children ?? <Icon icon='Share' />}
    </button>
  );
}

export default ShareButton;
