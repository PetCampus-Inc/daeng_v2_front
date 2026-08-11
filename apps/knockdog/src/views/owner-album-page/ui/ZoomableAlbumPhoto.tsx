'use client';

import { useEffect } from 'react';

import {
  usePinchZoom,
  type SwipeEdgeDirection,
} from '@views/owner-album-page/lib/usePinchZoom';

interface ZoomableAlbumPhotoProps {
  src: string;
  isActive: boolean;
  photoAspectClassName: string;
  onSwipeEdge?: (direction: SwipeEdgeDirection) => void;
  canSwipePrev?: boolean;
  canSwipeNext?: boolean;
  onLoadError?: () => void;
}

function ZoomableAlbumPhoto({
  src,
  isActive,
  photoAspectClassName,
  onSwipeEdge,
  canSwipePrev = false,
  canSwipeNext = false,
  onLoadError,
}: ZoomableAlbumPhotoProps) {
  const { getContainerProps, getFrameProps, getImageProps, reset } = usePinchZoom({
    enabled: isActive,
    onSwipeEdge,
    canSwipePrev,
    canSwipeNext,
  });

  useEffect(() => {
    if (!isActive) reset();
  }, [isActive, reset]);

  return (
    // 뷰포트 = 회색 배경 전체. 확대 최대 = 이 영역을 cover
    // 이미지는 CSS scale() 대신 width/height로 키움 (GPU 흰 실선 방지)
    <div {...getContainerProps()} className='bg-bg-50 relative h-full w-full touch-none overflow-hidden'>
      <div className='flex h-full w-full items-center justify-center px-4'>
        <div {...getFrameProps()} className={`relative w-full shrink-0 ${photoAspectClassName}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- S3 pre-signed URL 임시 미리보기 */}
          <img {...getImageProps()} src={src} alt='' onError={onLoadError} />
        </div>
      </div>
    </div>
  );
}

export { ZoomableAlbumPhoto };
