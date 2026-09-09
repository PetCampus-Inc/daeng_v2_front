'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { cn } from '@knockdog/ui/lib';

import { AlbumImageSkeleton } from './AlbumImageSkeleton';

interface AlbumImageProps {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  skeletonClassName?: string;
  loading?: 'lazy' | 'eager';
  /**
   * next/image 리사이즈. 그리드/스트립 썸네일용.
   * blob/data URL/상세 원본 줌은 false 유지.
   */
  optimize?: boolean;
  /** 뷰포트 기준 크기. optimize 시 전달 */
  sizes?: string;
  /** LCP 후보 — eager + fetchPriority high + 페이드 스킵 */
  priority?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
  onLoad?: () => void;
  onError?: () => void;
}

const REVEAL_TRANSITION_MS = 500;
const DEFAULT_OPTIMIZED_SIZES = '33vw';

function canUseNextImage(src: string) {
  return /^(https?:)/i.test(src);
}

/**
 * 앨범 이미지 — 로드 전 회색 스켈레톤, 완료 후 크로스페이드.
 * 부모(relative + 크기 지정) 안에서는 `absolute inset-0`으로 채운다.
 */
function AlbumImage(props: AlbumImageProps) {
  return <AlbumImageInner key={props.src} {...props} />;
}

function AlbumImageInner({
  src,
  alt = '',
  className,
  imgClassName,
  skeletonClassName,
  loading = 'lazy',
  optimize = false,
  sizes = DEFAULT_OPTIMIZED_SIZES,
  priority = false,
  fetchPriority,
  onLoad,
  onError,
}: AlbumImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [skipTransition, setSkipTransition] = useState(priority);
  const useOptimized = optimize && canUseNextImage(src);
  // LCP: opacity-0 → onLoad 페이드는 element render delay를 키움
  const shouldShowImmediately = priority || fetchPriority === 'high';

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setSkipTransition(true);
      setIsLoaded(true);
    }
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const revealClassName =
    shouldShowImmediately || skipTransition
      ? 'opacity-100'
      : cn(
          'transition-opacity duration-500 ease-out motion-reduce:transition-none',
          isLoaded ? 'opacity-100' : 'opacity-0'
        );

  const sharedClassName = cn(
    'absolute inset-0 size-full min-h-0 min-w-0 object-cover',
    revealClassName,
    imgClassName
  );

  return (
    <div className={cn('bg-bg-0 min-h-0 min-w-0 overflow-hidden', className)}>
      <div className='relative size-full min-h-0 min-w-0'>
        {!hasError ? (
          <AlbumImageSkeleton
            className={cn('pointer-events-none', skeletonClassName)}
            isVisible={!isLoaded}
          />
        ) : null}
        {!hasError ? (
          useOptimized ? (
            <Image
              src={src}
              alt={alt}
              fill
              sizes={sizes}
              priority={priority}
              // priority면 Next가 fetchpriority=high + preload. 명시적 auto/low는 LCP 경고 유발.
              {...(priority || fetchPriority === 'high'
                ? { fetchPriority: 'high' as const }
                : fetchPriority && fetchPriority !== 'auto'
                  ? { fetchPriority }
                  : {})}
              loading={priority ? undefined : loading}
              className={sharedClassName}
              onLoad={handleLoad}
              onError={() => {
                setHasError(true);
                onError?.();
              }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- S3 pre-signed / blob / 상세 원본
            <img
              ref={imgRef}
              src={src}
              alt={alt}
              loading={priority ? 'eager' : loading}
              {...(priority || fetchPriority === 'high'
                ? { fetchPriority: 'high' as const }
                : fetchPriority && fetchPriority !== 'auto'
                  ? { fetchPriority }
                  : {})}
              decoding={shouldShowImmediately ? 'sync' : 'async'}
              className={sharedClassName}
              onLoad={handleLoad}
              onError={() => {
                setHasError(true);
                onError?.();
              }}
            />
          )
        ) : (
          <div className='bg-fill-secondary-200 absolute inset-0 size-full' aria-hidden='true' />
        )}
      </div>
    </div>
  );
}

export { AlbumImage, REVEAL_TRANSITION_MS };
export type { AlbumImageProps };
