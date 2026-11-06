'use client';

import { ownerMypageContent } from '../config/ownerMypageContent';
import { openUnsavedExitDialog } from '@shared/lib/openUnsavedExitDialog';

function openOwnerUnsavedExitDialog(onConfirm: () => void) {
  openUnsavedExitDialog({
    onConfirm,
    title: ownerMypageContent.unsavedExitModalTitle,
    description: ownerMypageContent.unsavedExitModalDescription,
    cancelLabel: ownerMypageContent.unsavedExitModalCancelLabel,
    confirmLabel: ownerMypageContent.unsavedExitModalConfirmLabel,
  });
}

export { openOwnerUnsavedExitDialog };
