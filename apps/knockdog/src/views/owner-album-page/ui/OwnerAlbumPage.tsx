'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { ownerAlbumContent } from '@views/owner-album-page/config/ownerAlbumContent';
import { sortAlbumPhotos } from '@views/owner-album-page/lib/groupAlbumPhotosByDate';
import { useOwnerAlbumUpload } from '@views/owner-album-page/model/useOwnerAlbumUpload';
import { OwnerAlbumEmptyState } from '@views/owner-album-page/ui/OwnerAlbumEmptyState';
import { OwnerAlbumInfoSheet } from '@views/owner-album-page/ui/OwnerAlbumInfoSheet';
import { OwnerAlbumPhotoDetail } from '@views/owner-album-page/ui/OwnerAlbumPhotoDetail';
import { OwnerAlbumPhotoList } from '@views/owner-album-page/ui/OwnerAlbumPhotoList';
import { OwnerAlbumUploadButton } from '@views/owner-album-page/ui/OwnerAlbumUploadButton';
import { OwnerAlbumUploadModal } from '@views/owner-album-page/ui/OwnerAlbumUploadModal';

import { Header } from '@widgets/Header';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';

function OwnerAlbumPage() {
  const {
    photos,
    hasPhotos,
    isUploading,
    hasNextPage,
    isFetchingNextPage,
    isPhotosLoading,
    fetchNextPage,
    handleUploadClick,
    removePhoto,
  } = useOwnerAlbumUpload();
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const sortedPhotos = useMemo(() => sortAlbumPhotos(photos), [photos]);

  const handleInfoClick = () => {
    overlay.open(({ isOpen, close }) => <OwnerAlbumInfoSheet isOpen={isOpen} close={close} />);
  };

  const handlePhotoClick = (photoId: string) => {
    const index = sortedPhotos.findIndex((photo) => photo.id === photoId);
    if (index < 0) return;
    setDetailIndex(index);
  };

  return (
    <div className='bg-bg-50 flex h-dvh flex-col'>
      <div className='bg-bg-0 pt-(--safe-area-inset-top,0px)'>
        <Header>
          <Header.Title>{ownerAlbumContent.pageTitle}</Header.Title>
          <Header.RightSection>
            <button
              type='button'
              className='inline-flex size-6 items-center justify-center'
              aria-label={ownerAlbumContent.infoAriaLabel}
              onClick={handleInfoClick}
            >
              <Icon icon='InfoLine' className='text-text-secondary size-6' />
            </button>
          </Header.RightSection>
        </Header>
      </div>

      <main className={`${hasPhotos ? 'bg-bg-50' : 'bg-bg-0'} relative flex min-h-0 flex-1 flex-col`}>
        {isPhotosLoading && !hasPhotos ? (
          <DelayedLoadingSpinner isLoading={isPhotosLoading} layout='content' />
        ) : hasPhotos ? (
          <OwnerAlbumPhotoList
            photos={photos}
            onPhotoClick={handlePhotoClick}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        ) : (
          <OwnerAlbumEmptyState />
        )}
        <OwnerAlbumUploadButton onClick={handleUploadClick} />
      </main>

      <OwnerAlbumUploadModal isOpen={isUploading} />

      {detailIndex !== null ? (
        <OwnerAlbumPhotoDetail
          photos={sortedPhotos}
          initialIndex={detailIndex}
          onClose={() => setDetailIndex(null)}
          onDelete={removePhoto}
        />
      ) : null}
    </div>
  );
}

export { OwnerAlbumPage };
