import { Icon } from '@knockdog/ui';
import { useHeaderContext } from '../model/HeaderProvider';
import { cn } from '@knockdog/ui/lib';
import type { ComponentProps } from 'react';

type BackButtonProps = ComponentProps<'button'> & {
  children?: string;
};

function BackButton({ children, ...props }: BackButtonProps) {
  const { textColor } = useHeaderContext();

  return (
    <button className={cn('size-6', textColor)} {...props}>
      {children ?? <Icon icon='ChevronLeft' />}
    </button>
  );
}

export default BackButton;
