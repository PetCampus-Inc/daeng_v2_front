'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';

import { cn } from '@knockdog/ui/lib';

import { isNativeWebView } from '@shared/lib/device';

import { AlbumImageSkeleton } from './AlbumImageSkeleton';
import { canOptimizeWithNextImage } from '../lib/buildNextImageSrc';

interface AlbumImageProps {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  skeletonClassName?: string;
  loading?: 'lazy' | 'eager';
  /**
   * next/image 리사이즈. 기본 true.
   * blob/data URL·허용 호스트 밖·네이티브 WebView는 자동 스킵. 원본 픽셀이 필요하면 false.
   */
  optimize?: boolean;
  /** 뷰포트 기준 크기. optimize 시 전달 */
  sizes?: string;
  /** next/image quality (1–100). 썸네일은 65 권장 */
  quality?: number;
  /** LCP 후보 — eager + fetchPriority high + 페이드 스킵 */
  priority?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
  onLoad?: () => void;
  onError?: () => void;
}

const REVEAL_TRANSITION_MS = 500;
const DEFAULT_OPTIMIZED_SIZES = '33vw';

function subscribeNoop() {
  return () => undefined;
}

function useIsNativeWebView() {
  return useSyncExternalStore(subscribeNoop, isNativeWebView, () => false);
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
  /** 기본 true — S3 원본(수 MB)을 브라우저에 직접 받지 않음. blob/data는 자동 스킵 */
  optimize = true,
  sizes = DEFAULT_OPTIMIZED_SIZES,
  quality = 70,
  priority = false,
  fetchPriority,
  onLoad,
  onError,
}: AlbumImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [skipTransition, setSkipTransition] = useState(priority);
  /** `/_next/image` AVIF 등이 WebView에서 깨지면 원본 plain img로 재시도 */
  const [forcePlain, setForcePlain] = useState(false);
  const isNative = useIsNativeWebView();

  // AOS WebView: next/image(/_next/image) 디코드 실패 → 회색. DogCard와 동일하게 plain img.
  const useOptimized =
    optimize && canOptimizeWithNextImage(src) && !forcePlain && !isNative;
  // LCP: opacity-0 → onLoad 페이드는 element render delay를 키움
  const shouldShowImmediately = priority || fetchPriority === 'high';

  const markLoadedFromCache = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) {
      setSkipTransition(true);
      setIsLoaded(true);
    }
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleOptimizedError = () => {
    // 옵티마이저 실패 시 원본 URL로 폴백 (회색 고착 방지)
    setForcePlain(true);
    setIsLoaded(false);
  };

  const handlePlainError = () => {
    setHasError(true);
    onError?.();
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

  const fetchPriorityProps =
    priority || fetchPriority === 'high'
      ? { fetchPriority: 'high' as const }
      : fetchPriority && fetchPriority !== 'auto'
        ? { fetchPriority }
        : {};

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
              quality={quality}
              priority={priority}
              // priority면 Next가 fetchpriority=high + preload. 명시적 auto/low는 LCP 경고 유발.
              {...fetchPriorityProps}
              loading={priority ? undefined : loading}
              className={sharedClassName}
              onLoad={handleLoad}
              onError={handleOptimizedError}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- WebView / S3 pre-signed / blob / 옵티마이저 폴백
            <img
              ref={markLoadedFromCache}
              src={src}
              alt={alt}
              loading={priority ? 'eager' : loading}
              {...fetchPriorityProps}
              decoding={shouldShowImmediately ? 'sync' : 'async'}
              referrerPolicy='no-referrer'
              className={sharedClassName}
              onLoad={handleLoad}
              onError={handlePlainError}
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
