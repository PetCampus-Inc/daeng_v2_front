import { ComponentProps } from 'react';
import { Icon } from '@knockdog/ui';
import { useHeaderContext } from '@widgets/Header/model/HeaderProvider';
import { cn } from '@knockdog/ui/lib';

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
