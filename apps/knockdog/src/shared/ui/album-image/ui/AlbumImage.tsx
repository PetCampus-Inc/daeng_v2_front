'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@knockdog/ui/lib';

import { AlbumImageSkeleton } from './AlbumImageSkeleton';

interface AlbumImageProps {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  skeletonClassName?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

const REVEAL_TRANSITION_MS = 500;

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
  onLoad,
  onError,
}: AlbumImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);

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

  const revealClassName = skipTransition
    ? 'opacity-100'
    : cn(
        'transition-opacity duration-500 ease-out motion-reduce:transition-none',
        isLoaded ? 'opacity-100' : 'opacity-0'
      );

  return (
    <div className={cn('min-h-0 min-w-0 overflow-hidden', className)}>
      <div className='relative size-full min-h-0 min-w-0'>
        {!hasError ? (
          <AlbumImageSkeleton
            className={cn('pointer-events-none', skeletonClassName)}
            isVisible={!isLoaded}
          />
        ) : null}
        {!hasError ? (
          // eslint-disable-next-line @next/next/no-img-element -- S3 pre-signed / 앨범 썸네일
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            loading={loading}
            decoding='async'
            className={cn(
              'absolute inset-0 size-full min-h-0 min-w-0 object-cover',
              revealClassName,
              imgClassName
            )}
            onLoad={handleLoad}
            onError={() => {
              setHasError(true);
              onError?.();
            }}
          />
        ) : (
          <div className='bg-fill-secondary-200 absolute inset-0 size-full' aria-hidden='true' />
        )}
      </div>
    </div>
  );
}

export { AlbumImage, REVEAL_TRANSITION_MS };
export type { AlbumImageProps };
