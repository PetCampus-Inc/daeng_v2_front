import type { Review } from '@entities/review';
import { Avatar, AvatarImage, AvatarFallback, Icon } from '@knockdog/ui';

export function ReviewCard({ username, profileImage, title, content, updatedAt }: Review) {
  return (
    <div className='bg-primitive-neutral-50 mb-2 flex flex-col gap-1 rounded-lg p-4'>
      <div className='flex items-center gap-1'>
        <Avatar className='mr-1 inline-block size-6'>
          <AvatarImage src={profileImage} alt='프로필 이미지' />
          <AvatarFallback className='bg-fill-secondary-200 p-[3px]'>
            <Icon icon='User' className='size-6' />
          </AvatarFallback>
        </Avatar>

        <span className='body2-extrabold'>{username}</span>
      </div>
      <span className='body1-bold'>{title}</span>
      <p className='body2-regular text-text-secondary mb-[15px] line-clamp-2'>{content}</p>

      <div className='body2-regular text-text-tertiary'>{updatedAt}</div>
    </div>
  );
}
