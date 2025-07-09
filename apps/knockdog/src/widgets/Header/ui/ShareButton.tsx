import { ComponentProps } from 'react';
import { Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { useHeaderContext } from '../model/HeaderProvider';

type ShareButtonProps = ComponentProps<'button'> & {
  children?: string;
};

function ShareButton({ children, ...props }: ShareButtonProps) {
  const { textColor } = useHeaderContext();

  return (
    <button className={cn('size-6', textColor)} {...props}>
      {children ?? <Icon icon='Share' />}
    </button>
  );
}

export default ShareButton;
