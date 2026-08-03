'use client';

import { ownerAlbumContent } from '@views/owner-album-page/config/ownerAlbumContent';

import { RingLoadingSpinner } from '@shared/ui/loading-spinner';

interface OwnerAlbumUploadModalProps {
  isOpen: boolean;
}

function OwnerAlbumUploadModal({ isOpen }: OwnerAlbumUploadModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-modal flex items-center justify-center bg-[rgb(15,20,26)]/70 px-10'
      role='alertdialog'
      aria-modal='true'
      aria-busy='true'
      aria-label={ownerAlbumContent.uploadModalMessage}
    >
      <div className='radius-r4 bg-bg-0 flex w-full max-w-[280px] flex-col items-center gap-4 px-6 py-8'>
        <RingLoadingSpinner size={40} />
        <p className='body1-bold text-text-primary whitespace-pre-line text-center'>
          {ownerAlbumContent.uploadModalMessage}
        </p>
      </div>
    </div>
  );
}

export { OwnerAlbumUploadModal };
