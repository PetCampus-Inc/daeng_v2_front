import { Icon, IconType } from '@knockdog/ui';
import { PropsWithChildren } from 'react';

export function Badge({
  children,
  icon,
  caption,
  className = '',
}: PropsWithChildren<{ icon?: IconType; caption?: string; className?: string }>) {
  return (
    <div
      className={`text-text-primary mx-auto flex w-fit items-center justify-center gap-1 rounded-lg bg-neutral-100 px-3 py-1.5 ${className}`}
    >
      {icon && <Icon icon={icon} className='h-5 w-5' />}
      <span className='label-medium text-sm'>{children}</span>
      {caption && <span className='text-text-tertiary caption1-regular'>{caption}</span>}
    </div>
  );
}
