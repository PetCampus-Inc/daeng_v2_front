import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

import { RoleBadge } from '../role-badge';

interface ProfileNavigationCellProps extends Omit<ComponentProps<'button'>, 'children' | 'name' | 'role'> {
  name: ReactNode;
  avatarSrc: string;
  avatarAlt?: string;
  role?: ReactNode;
}

function NextMark() {
  return (
    <span className='bg-fill-secondary-50 radius-full inline-flex size-8 shrink-0 items-center justify-center'>
      <span className='-rotate-90'>
        <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M4 6L8 10L12 6'
            className='text-text-secondary-inverse'
            stroke='currentColor'
            strokeWidth='1.33333'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </span>
    </span>
  );
}

/** V4 / Navigation / Profile Navigation Cell */
function ProfileNavigationCell({
  name,
  avatarSrc,
  avatarAlt = '',
  role = '원장',
  className,
  type = 'button',
  ...props
}: ProfileNavigationCellProps) {
  return (
    <button
      type={type}
      className={cn('bg-bg-0 flex w-full items-center justify-between pt-x5 pr-x4 pb-x4 pl-x5', className)}
      {...props}
    >
      <span className='flex min-w-0 items-center gap-x2'>
        <img alt={avatarAlt} src={avatarSrc} className='border-line-100 bg-bg-50 size-9 rounded-full border object-cover' />
        <span className='h3-extrabold text-text-primary truncate'>{name}</span>
        <RoleBadge>{role}</RoleBadge>
      </span>
      <NextMark />
    </button>
  );
}

export { ProfileNavigationCell };
export type { ProfileNavigationCellProps };
