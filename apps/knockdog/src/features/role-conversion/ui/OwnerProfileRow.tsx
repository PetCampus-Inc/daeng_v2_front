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
      <Avatar className='border-line-100 size-10 border'>
        {profileImageUrl ? (
          <AvatarImage src={profileImageUrl} alt={name} className='object-cover' />
        ) : null}
        <AvatarFallback className='bg-fill-secondary-50' />
      </Avatar>

      <div className='flex min-w-0 flex-1 items-center gap-x-1 py-2'>
        <span className='h3-extrabold text-text-primary truncate'>{name}</span>
        <span className='bg-fill-secondary-700 caption1-semibold text-text-primary-inverse shrink-0 rounded-full px-2 py-1'>
          {ownerMypageContent.ownerBadgeLabel}
        </span>
      </div>

      <Icon icon='ChevronRight' className='text-text-tertiary size-6 shrink-0' aria-hidden />
    </>
  );

  if (!onClick) {
    return <div className='flex w-full items-center gap-x-2 px-4 py-4'>{content}</div>;
  }

  return (
    <button type='button' onClick={onClick} className='flex w-full items-center gap-x-2 px-4 py-4'>
      {content}
    </button>
  );
}

export { OwnerProfileRow };
export type { OwnerProfileRowProps };
