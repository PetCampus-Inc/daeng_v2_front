'use client';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import type { GuardianAlbumPhoto } from '@views/guardian-album-page/config/guardianAlbumTodayMock';
import { Header } from '@widgets/Header';

interface GuardianAlbumPhotoGridProps {
  photos: GuardianAlbumPhoto[];
  title: string;
  onClose: () => void;
  onPhotoClick: (index: number) => void;
}

function GuardianAlbumPhotoGrid({
  photos,
  title,
  onClose,
  onPhotoClick,
}: GuardianAlbumPhotoGridProps) {
  const { detail } = guardianAlbumContent;

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-label={title}
      className='bg-bg-0 z-modal fixed inset-0 flex flex-col'
    >
      <div className='bg-bg-0 shrink-0 pt-(--safe-area-inset-top,0px)'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton onClick={onClose} />
          </Header.LeftSection>
          <Header.Title>{title}</Header.Title>
        </Header>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto pb-(--safe-area-inset-bottom,0px)'>
        <div className='grid grid-cols-4 gap-1 px-4 pt-5'>
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type='button'
              onClick={() => onPhotoClick(index)}
              aria-label={detail.thumbnailAriaLabel(index)}
              className='bg-fill-secondary-100 radius-r2 relative aspect-square overflow-hidden'
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- mock/S3 앨범 썸네일 */}
              <img
                src={photo.url}
                alt=''
                className='radius-r2 size-full object-cover'
                loading='lazy'
                decoding='async'
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { GuardianAlbumPhotoGrid };
