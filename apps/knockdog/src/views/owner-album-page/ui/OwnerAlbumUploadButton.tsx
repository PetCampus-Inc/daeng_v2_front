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
      className='absolute right-4 z-10 web:bottom-[calc(var(--bottom-bar-height)+20px)] webview:bottom-5'
      onClick={onClick}
    />
  );
}

export { OwnerAlbumUploadButton };
