import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

interface DisconnectButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  children?: ReactNode;
}

/** V4 / Button / Disconnect Action */
function DisconnectButton({ children = '연결해제', className, type = 'button', ...props }: DisconnectButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'label-semibold text-text-accent radius-r1 inline-flex h-x6 items-center justify-center px-x2 py-x1',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { DisconnectButton };
export type { DisconnectButtonProps };
