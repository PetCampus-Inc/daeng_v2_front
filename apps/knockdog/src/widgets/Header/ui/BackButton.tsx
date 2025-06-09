import { ComponentProps } from 'react';
import { Icon } from '@knockdog/ui';
import { useHeaderContext } from '@widgets/Header/model/HeaderProvider';
import { cn } from '@knockdog/ui/lib';

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
