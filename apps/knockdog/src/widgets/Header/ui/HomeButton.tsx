import { ComponentProps } from 'react';
import { Icon } from '@knockdog/ui';
import { useHeaderContext } from '@widgets/Header/model/HeaderProvider';
import { cn } from '@knockdog/ui/lib';

function HomeButton({ children, ...props }: ComponentProps<'button'>) {
  const { textColor } = useHeaderContext();

  return (
    <button className={cn('size-6', textColor)} {...props}>
      {children ?? <Icon icon='Home' />}
    </button>
  );
}

export default HomeButton;
