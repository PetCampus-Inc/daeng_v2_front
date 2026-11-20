import { type ComponentProps, type ReactNode } from 'react';

import { Change } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

interface RoleSwitchButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  children?: ReactNode;
}

/** V4 / Button / Base */
function RoleSwitchButton({ children = '보호자로 전환', className, type = 'button', ...props }: RoleSwitchButtonProps) {
  return (
    <button
      type={type}
      className={cn('bg-fill-primary-50 flex w-full items-center justify-between p-x4', className)}
      {...props}
    >
      <span className='body1-bold text-primitive-orange-400 px-x1'>{children}</span>
      <span className='flex size-6 items-center justify-center'>
        <Change width={20} height={20} className='text-primitive-orange-300' />
      </span>
    </button>
  );
}

export { RoleSwitchButton };
export type { RoleSwitchButtonProps };
