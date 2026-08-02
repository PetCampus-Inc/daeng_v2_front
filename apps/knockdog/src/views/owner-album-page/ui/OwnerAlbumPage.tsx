'use client';

import { Icon } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { ownerAlbumContent } from '@views/owner-album-page/config/ownerAlbumContent';
import { useOwnerAlbumUpload } from '@views/owner-album-page/model/useOwnerAlbumUpload';
import { OwnerAlbumEmptyState } from '@views/owner-album-page/ui/OwnerAlbumEmptyState';
import { OwnerAlbumInfoSheet } from '@views/owner-album-page/ui/OwnerAlbumInfoSheet';
import { OwnerAlbumPhotoList } from '@views/owner-album-page/ui/OwnerAlbumPhotoList';
import { OwnerAlbumUploadButton } from '@views/owner-album-page/ui/OwnerAlbumUploadButton';
import { OwnerAlbumUploadModal } from '@views/owner-album-page/ui/OwnerAlbumUploadModal';

import { Header } from '@widgets/Header';

function OwnerAlbumPage() {
  const { photos, hasPhotos, isUploading, handleUploadClick } = useOwnerAlbumUpload();

  const handleInfoClick = () => {
    overlay.open(({ isOpen, close }) => <OwnerAlbumInfoSheet isOpen={isOpen} close={close} />);
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
        {hasPhotos ? <OwnerAlbumPhotoList photos={photos} /> : <OwnerAlbumEmptyState />}
        <OwnerAlbumUploadButton onClick={handleUploadClick} />
      </main>

      <OwnerAlbumUploadModal isOpen={isUploading} />
    </div>
  );
}

export { OwnerAlbumPage };
