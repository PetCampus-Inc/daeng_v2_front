'use client';

import { Icon } from '@knockdog/ui';

import { ownerAlbumContent } from '@views/owner-album-page/config/ownerAlbumContent';
import { OwnerAlbumEmptyState } from '@views/owner-album-page/ui/OwnerAlbumEmptyState';
import { OwnerAlbumUploadButton } from '@views/owner-album-page/ui/OwnerAlbumUploadButton';

import { Header } from '@widgets/Header';

function OwnerAlbumPage() {
  // TODO: 앨범 목록 API 연동 후 유무에 따라 empty / grid 분기
  const hasPhotos = false;

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
            >
              <Icon icon='InfoLine' className='text-text-secondary-700 size-6' />
            </button>
          </Header.RightSection>
        </Header>
      </div>

      <main className='bg-bg-0 relative flex min-h-0 flex-1 flex-col'>
        {hasPhotos ? null : <OwnerAlbumEmptyState />}
        <OwnerAlbumUploadButton />
      </main>
    </div>
  );
}

export { OwnerAlbumPage };
