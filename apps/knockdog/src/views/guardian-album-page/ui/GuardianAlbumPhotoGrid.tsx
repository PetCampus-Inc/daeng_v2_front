'use client';

import { AlbumImage } from '@shared/ui/album-image';
import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import type { GuardianAlbumPhoto } from '@views/guardian-album-page/config/guardianAlbumTodayMock';
import { Header } from '@widgets/Header';

interface GuardianAlbumPhotoGridProps {
  photos: GuardianAlbumPhoto[];
  title: string;
  failedPhotoIds?: Set<string>;
  onClose: () => void;
  onPhotoClick: (index: number) => void;
}

function GuardianAlbumPhotoGrid({
  photos,
  title,
  failedPhotoIds,
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
          {photos.map((photo, index) => {
            const hasError = photo.hasLoadError === true || failedPhotoIds?.has(photo.id) === true;

            return (
              <button
                key={photo.id}
                type='button'
                onClick={() => onPhotoClick(index)}
                aria-label={detail.thumbnailAriaLabel(index)}
                className='bg-fill-secondary-100 radius-r2 relative aspect-square overflow-hidden'
              >
                {hasError ? (
                  <div className='bg-fill-secondary-200 radius-r2 absolute inset-0' />
                ) : (
                  <AlbumImage src={photo.url} className='absolute inset-0 radius-r2' />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { GuardianAlbumPhotoGrid };
