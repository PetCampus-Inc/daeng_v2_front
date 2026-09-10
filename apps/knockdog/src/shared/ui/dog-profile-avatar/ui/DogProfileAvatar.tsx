import { Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { buildNextImageSrc, canOptimizeWithNextImage } from '@shared/ui/album-image';
import { resolvePublicImageSrc } from '@shared/lib/utils/resolvePublicImageSrc';

interface DogProfileAvatarProps {
  name: string;
  imageUrl?: string | null;
  className?: string;
  /** 프로필 없을 때 Paw 색. 기본 `text-fill-secondary-400` */
  pawClassName?: string;
  /**
   * 표시 크기(px) 기준 next/image 리사이즈 폭.
   * 기본 192 ≈ 64px × 3dpr.
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
function DogProfileAvatar({
  name,
  imageUrl,
  className,
  pawClassName,
  optimizeWidth = 192,
}: DogProfileAvatarProps) {
  const resolved = imageUrl?.trim() ? resolvePublicImageSrc(imageUrl.trim()) : '';
  if (!resolved) return <PawPlaceholder className={className} pawClassName={pawClassName} />;

  // 허용 호스트만 next/image 리사이즈. 그 외는 resolved 원본 유지
  const src = canOptimizeWithNextImage(resolved)
    ? buildNextImageSrc(resolved, optimizeWidth, 70)
    : resolved;

  return (
    <Avatar className={cn('bg-bg-50 size-11 shrink-0 border-2 border-white', className)}>
      <AvatarImage src={src} alt={`${name} 프로필`} className='object-cover' />
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
