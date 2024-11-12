import { cn } from '@knockdog/ui/lib';
import { ReactNode } from 'react';
import { Icon } from '../icon';

interface DismissibleCardProps {
  children?: ReactNode;
  className?: string;
  onRemove?: () => void;
}
const DismissibleCard = ({
  children,
  className,
  onRemove,
}: DismissibleCardProps) => {
  return (
    <div
      className={cn(
        'border-brown3 bg-brown4 text-primary relative rounded-lg border p-4',
        className
      )}
    >
      <button
        className={cn('absolute right-[-15px] top-[-15px] rounded-full p-1')}
        onClick={onRemove}
      >
        <Icon icon='CircleClose' />
      </button>
      <div className={cn('flex items-center justify-center')}>{children}</div>
    </div>
  );
};

export { DismissibleCard };
