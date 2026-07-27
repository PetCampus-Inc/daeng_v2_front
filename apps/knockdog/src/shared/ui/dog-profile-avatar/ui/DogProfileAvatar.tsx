import { Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

interface DogProfileAvatarProps {
  name: string;
  imageUrl?: string;
  className?: string;
}

/** 흰색 테두리 포함 강아지 프로필 원형 아바타 */
function DogProfileAvatar({ name, imageUrl, className }: DogProfileAvatarProps) {
  return (
    <Avatar className={cn('size-11 shrink-0 border-2 border-white', className)}>
      {imageUrl ? (
        <AvatarImage src={imageUrl} alt={`${name} 프로필`} className='object-cover' />
      ) : null}
      <AvatarFallback className='bg-bg-50'>
        <Icon icon='Paw' className='text-fill-secondary-400 size-6' />
      </AvatarFallback>
    </Avatar>
  );
}

export { DogProfileAvatar };
export type { DogProfileAvatarProps };
