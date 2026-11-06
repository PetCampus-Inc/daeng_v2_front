import { Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { resolvePublicImageSrc } from '@shared/lib/utils/resolvePublicImageSrc';

interface DogProfileAvatarProps {
  name: string;
  imageUrl?: string | null;
  className?: string;
  /** 프로필 없을 때 Paw 색. 기본 `text-fill-secondary-400` */
  pawClassName?: string;
  /**
   * @deprecated Avatar는 plain img라 next/image 수동 URL을 쓰지 않음.
   * WebView에서 `/_next/image`(AVIF 등) 디코드 실패로 폴백되던 이슈 방지.
   */
  optimizeWidth?: number;
}

function PawPlaceholder({ className, pawClassName }: { className?: string; pawClassName?: string }) {
  return (
    <span
      className={cn(
        'bg-bg-50 inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white',
        className
      )}
      aria-hidden='true'
    >
      <Icon icon='Paw' className={cn('text-fill-secondary-400 size-6', pawClassName)} />
    </span>
  );
}

/** 흰색 테두리 포함 강아지 프로필 원형 아바타. 이미지 없으면 회색 발바닥 플레이스홀더. */
function DogProfileAvatar({ name, imageUrl, className, pawClassName }: DogProfileAvatarProps) {
  const resolved = imageUrl?.trim() ? resolvePublicImageSrc(imageUrl.trim()) : '';
  if (!resolved) return <PawPlaceholder className={className} pawClassName={pawClassName} />;

  return (
    <Avatar className={cn('bg-bg-50 size-11 shrink-0 border-2 border-white', className)}>
      <AvatarImage src={resolved} alt={`${name} 프로필`} className='object-cover' />
      <AvatarFallback delayMs={0} className='bg-bg-50'>
        <Icon
          icon='Paw'
          className={cn('text-fill-secondary-400 size-6', pawClassName)}
          aria-hidden='true'
        />
      </AvatarFallback>
    </Avatar>
  );
}

export { DogProfileAvatar };
export type { DogProfileAvatarProps };
