import { Icon } from '@knockdog/ui';
import { useHeaderContext } from '../model/HeaderProvider';
import { cn } from '@knockdog/ui/lib';
import type { ComponentProps } from 'react';
import { useRouter } from 'next/navigation';

type BackButtonProps = ComponentProps<'button'> & {
  children?: string;
};

function BackButton({ children, ...props }: BackButtonProps) {
  const router = useRouter();
  const { textColor } = useHeaderContext();

  const handleBackClick = () => {
    router.back();
  };

  return (
    <button className={cn('size-6', textColor)} onClick={handleBackClick} {...props}>
      {children ?? <Icon icon='ChevronLeft' />}
    </button>
  );
}

export default BackButton;
