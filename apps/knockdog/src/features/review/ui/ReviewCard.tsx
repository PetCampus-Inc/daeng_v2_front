'use client';

import type { Review } from '@entities/review';
import { Avatar, AvatarImage, AvatarFallback, Icon } from '@knockdog/ui';
import { useStackNavigation } from '@shared/lib/bridge';

export function ReviewCard({ username, profileImage, title, content, updatedAt, reviewUrl }: Review) {
  const { push } = useStackNavigation();

  const handleClick = () => {
    if (reviewUrl) {
      push({ pathname: reviewUrl });
    }
  };

  return (
    <div
      className='bg-bg-50 flex flex-col gap-3 rounded-lg p-4'
      onClick={handleClick}
      role={reviewUrl ? 'button' : undefined}
      style={reviewUrl ? { cursor: 'pointer' } : undefined}
    >
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-1'>
          <Avatar className='size-6'>
            <AvatarImage src={profileImage} alt='' />
            <AvatarFallback className='bg-fill-secondary-200 p-[3px]'>
              <Icon icon='User' className='size-6' />
            </AvatarFallback>
          </Avatar>
          <span className='body2-extrabold truncate'>{username}</span>
        </div>
        <span className='body1-bold truncate'>{title}</span>
        <p className='body2-regular text-text-secondary line-clamp-2'>{content}</p>
      </div>
      <p className='body2-regular text-text-tertiary'>{updatedAt}</p>
    </div>
  );
}
