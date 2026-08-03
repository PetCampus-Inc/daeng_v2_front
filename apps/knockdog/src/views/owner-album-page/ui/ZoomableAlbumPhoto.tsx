'use client';

import { useEffect } from 'react';

import { usePinchZoom } from '@views/owner-album-page/lib/usePinchZoom';

interface ZoomableAlbumPhotoProps {
  src: string;
  isActive: boolean;
  photoAspectClassName: string;
}

function ZoomableAlbumPhoto({ src, isActive, photoAspectClassName }: ZoomableAlbumPhotoProps) {
  const { getContainerProps, getContentProps, reset } = usePinchZoom({ enabled: isActive });

  useEffect(() => {
    if (!isActive) reset();
  }, [isActive, reset]);

  return (
    // 뷰포트 = 회색 배경 전체. 확대 최대 = 이 영역을 cover
    <div {...getContainerProps()} className='bg-bg-50 relative h-full w-full touch-none overflow-hidden'>
      <div className='flex h-full w-full items-center justify-center px-4'>
        <div
          {...getContentProps()}
          className={`relative w-full shrink-0 overflow-hidden backface-hidden ${photoAspectClassName}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- S3 pre-signed URL 임시 미리보기 */}
          <img
            src={src}
            alt=''
            // inset -1px: scale 시 서브픽셀 틈으로 흰 실선 생기는 것 방지
            className='absolute -inset-px h-[calc(100%+2px)] w-[calc(100%+2px)] max-w-none select-none object-cover backface-hidden'
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

export { ZoomableAlbumPhoto };
