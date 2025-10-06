import { Icon } from '@knockdog/ui';
import { useHeaderContext } from '../model/HeaderProvider';
import { cn } from '@knockdog/ui/lib';
import type { ComponentProps } from 'react';
import { useStackNavigation } from '@shared/lib/bridge';

type BackButtonProps = ComponentProps<'button'> & {
  children?: string;
};

function BackButton({ children, onClick, ...props }: BackButtonProps) {
  const { back } = useStackNavigation();
  const { textColor } = useHeaderContext();

  const handleBackClick = () => {
    back();
  };

  return (
    <button className={cn('size-6', textColor)} onClick={onClick ?? handleBackClick} {...props}>
      {children ?? <Icon icon='ChevronLeft' />}
    </button>
  );
}

export default BackButton;
