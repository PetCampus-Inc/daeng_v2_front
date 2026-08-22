import { Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { resolvePublicImageSrc } from '@shared/lib/utils/resolvePublicImageSrc';

interface DogProfileAvatarProps {
  name: string;
  imageUrl?: string | null;
  className?: string;
}

function PawPlaceholder({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'bg-bg-50 inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white',
        className
      )}
      aria-hidden='true'
    >
      <Icon icon='Paw' className='text-fill-secondary-400 size-6' />
    </span>
  );
}

/** 흰색 테두리 포함 강아지 프로필 원형 아바타. 이미지 없으면 회색 발바닥 플레이스홀더. */
function DogProfileAvatar({ name, imageUrl, className }: DogProfileAvatarProps) {
  const src = imageUrl?.trim() ? resolvePublicImageSrc(imageUrl.trim()) : '';
  if (!src) return <PawPlaceholder className={className} />;

  return (
    <Avatar className={cn('bg-bg-50 size-11 shrink-0 border-2 border-white', className)}>
      <AvatarImage src={src} alt={`${name} 프로필`} className='object-cover' />
      <AvatarFallback delayMs={0} className='bg-bg-50'>
        <Icon icon='Paw' className='text-fill-secondary-400 size-6' aria-hidden='true' />
      </AvatarFallback>
    </Avatar>
  );
}

export { DogProfileAvatar };
export type { DogProfileAvatarProps };
