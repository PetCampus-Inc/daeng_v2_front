'use client';

import { Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';

import { ownerMypageContent } from '../config/ownerMypageContent';

interface OwnerProfileRowProps {
  name: string;
  profileImageUrl?: string;
  onClick?: () => void;
}

function OwnerProfileRow({ name, profileImageUrl, onClick }: OwnerProfileRowProps) {
  const content = (
    <>
      <span className='flex min-w-0 items-center gap-2'>
        <Avatar className='border-line-100 size-9 border'>
          {profileImageUrl ? <AvatarImage src={profileImageUrl} alt={name} className='object-cover' /> : null}
          <AvatarFallback className='bg-fill-secondary-50'>
            <Icon icon='Paw' className='text-fill-secondary-300 size-4' aria-hidden='true' />
          </AvatarFallback>
        </Avatar>
        <span className='h3-extrabold text-text-primary truncate'>{name}</span>
        <span className='bg-fill-secondary-100 caption1-semibold text-text-secondary radius-r3 shrink-0 px-2 pt-1.5 pb-1'>
          {ownerMypageContent.ownerBadgeLabel}
        </span>
      </span>
      <span className='bg-fill-secondary-50 flex size-8 shrink-0 items-center justify-center rounded-full'>
        <Icon icon='ChevronRight' className='text-text-tertiary size-4' aria-hidden />
      </span>
    </>
  );

  const className = 'flex w-full items-center justify-between pt-5 pr-4 pb-4 pl-5';

  if (!onClick) {
    return <div className={className}>{content}</div>;
  }

  return (
    <button type='button' onClick={onClick} className={className}>
      {content}
    </button>
  );
}

export { OwnerProfileRow };
export type { OwnerProfileRowProps };
