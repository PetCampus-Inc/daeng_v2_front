import { ComponentProps } from 'react';
import { Icon } from '@knockdog/ui';

type BackButtonProps = ComponentProps<'button'> & {
  children?: string;
};

function BackButton({ children, ...props }: BackButtonProps) {
  return (
    <button className='size-6' {...props}>
      {children ?? <Icon icon='ChevronLeft' />}
    </button>
  );
}

export default BackButton;
