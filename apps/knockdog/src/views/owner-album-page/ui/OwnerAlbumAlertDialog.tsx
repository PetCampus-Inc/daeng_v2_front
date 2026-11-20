'use client';

import { overlay } from 'overlay-kit';

import { openConfirmDialog } from '@shared/lib/bridge';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import { ownerAlbumContent } from '@views/owner-album-page/config/ownerAlbumContent';

function openWebAlbumAlert(title: string, description: string) {
  overlay.open(({ isOpen, close }) => (
    <ConfirmDialog
      isOpen={isOpen}
      title={title}
      description={description}
      confirmLabel={ownerAlbumContent.upload.confirmLabel}
      onClose={close}
      onConfirm={close}
    />
  ));
}

/** 업로드 로딩 모달이 내려간 뒤 띄워서 딤 오버레이가 가려지지 않게 함 */
function openOwnerAlbumAlert(title: string, description: string) {
  setTimeout(async () => {
    const result = await openConfirmDialog({
      title,
      description,
      confirmLabel: ownerAlbumContent.upload.confirmLabel,
      showCancelButton: false,
    });

    if (result.status === 'unavailable') openWebAlbumAlert(title, description);
  }, 0);
}

export { openOwnerAlbumAlert };
