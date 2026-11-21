'use client';

import { overlay } from 'overlay-kit';

import { editMemoContent } from '@views/edit-memo-page/config/editMemoContent';

import { openConfirmDialog } from '@shared/lib/bridge';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';

const { confirmLabel } = editMemoContent.imageUpload;

function openWebImageAlert(title: string, description: string) {
  overlay.open(({ isOpen, close }) => (
    <ConfirmDialog
      isOpen={isOpen}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      onClose={close}
      onConfirm={close}
    />
  ));
}

/** 네이티브 confirm → 웹 확인창 폴백 */
function openMemoImageAlert(title: string, description: string) {
  setTimeout(async () => {
    const result = await openConfirmDialog({ title, description, confirmLabel, showCancelButton: false });
    if (result.status === 'unavailable') openWebImageAlert(title, description);
  }, 0);
}

export { openMemoImageAlert };
