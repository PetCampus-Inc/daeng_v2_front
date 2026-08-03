'use client';

import { FloatingActionButton } from '@knockdog/ui';

import { ownerAlbumContent } from '@views/owner-album-page/config/ownerAlbumContent';

interface OwnerAlbumUploadButtonProps {
  onClick?: () => void;
}

function OwnerAlbumUploadButton({ onClick }: OwnerAlbumUploadButtonProps) {
  return (
    <FloatingActionButton
      type='button'
      icon='Plus'
      label={ownerAlbumContent.uploadButtonLabel}
      extended={false}
      aria-label={ownerAlbumContent.uploadButtonLabel}
      className='absolute right-4 bottom-[calc(var(--bottom-bar-height)+20px)] z-10'
      onClick={onClick}
    />
  );
}

export { OwnerAlbumUploadButton };
