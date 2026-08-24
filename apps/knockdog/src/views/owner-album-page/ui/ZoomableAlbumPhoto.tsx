'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type SyntheticEvent } from 'react';

import {
  usePinchZoom,
  type SwipeEdgeDirection,
} from '@views/owner-album-page/lib/usePinchZoom';

interface ZoomableAlbumPhotoProps {
  src: string;
  isActive: boolean;
  onSwipeEdge?: (direction: SwipeEdgeDirection) => void;
  canSwipePrev?: boolean;
  canSwipeNext?: boolean;
  onLoadError?: () => void;
}

function getContainSize(naturalWidth: number, naturalHeight: number, maxWidth: number, maxHeight: number) {
  if (naturalWidth <= 0 || naturalHeight <= 0 || maxWidth <= 0 || maxHeight <= 0) return null;
  const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
  return { width: naturalWidth * scale, height: naturalHeight * scale };
}

function ZoomableAlbumPhoto({
  src,
  isActive,
  onSwipeEdge,
  canSwipePrev = false,
  canSwipeNext = false,
  onLoadError,
}: ZoomableAlbumPhotoProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const naturalSizeRef = useRef({ width: 0, height: 0 });
  const [frameSize, setFrameSize] = useState<{ width: number; height: number } | null>(null);
  const { getContainerProps, getFrameProps, getImageProps, reset } = usePinchZoom({
    enabled: isActive,
    onSwipeEdge,
    canSwipePrev,
    canSwipeNext,
  });

  const updateFrameSize = useCallback(() => {
    const viewport = viewportRef.current;
    const { width: naturalWidth, height: naturalHeight } = naturalSizeRef.current;
    if (!viewport || naturalWidth <= 0 || naturalHeight <= 0) return;

    const nextSize = getContainSize(
      naturalWidth,
      naturalHeight,
      viewport.clientWidth,
      viewport.clientHeight
    );
    if (!nextSize) return;

    setFrameSize((prev) => {
      if (
        prev &&
        Math.abs(prev.width - nextSize.width) < 0.5 &&
        Math.abs(prev.height - nextSize.height) < 0.5
      ) {
        return prev;
      }
      return nextSize;
    });
  }, []);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    naturalSizeRef.current = { width: image.naturalWidth, height: image.naturalHeight };
    updateFrameSize();
  };

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(() => updateFrameSize());
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [updateFrameSize]);

  useLayoutEffect(() => {
    if (!frameSize) return;
    reset();
  }, [frameSize, reset]);

  useEffect(() => {
    naturalSizeRef.current = { width: 0, height: 0 };
    setFrameSize(null);
  }, [src]);

  useEffect(() => {
    if (!isActive) reset();
  }, [isActive, reset]);

  return (
    // 뷰포트 = 회색 배경 전체. 확대 최대 = 이 영역을 cover
    // 이미지는 CSS scale() 대신 width/height로 키움 (GPU 흰 실선 방지)
    <div {...getContainerProps()} className='bg-bg-50 relative h-full w-full touch-none overflow-hidden'>
      <div className='h-full w-full px-4'>
        <div ref={viewportRef} className='flex h-full w-full items-center justify-center'>
          <div
            {...getFrameProps()}
            className='relative shrink-0'
            style={
              frameSize
                ? { width: frameSize.width, height: frameSize.height }
                : { width: '100%', visibility: 'hidden' }
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- S3 pre-signed URL 임시 미리보기 */}
            <img {...getImageProps()} src={src} alt='' onLoad={handleLoad} onError={onLoadError} />
          </div>
        </div>
      </div>
    </div>
  );
}

export { ZoomableAlbumPhoto };
