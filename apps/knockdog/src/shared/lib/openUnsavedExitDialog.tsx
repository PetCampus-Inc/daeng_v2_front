'use client';

import { overlay } from 'overlay-kit';

import { UnsavedExitAlertDialog } from '@shared/ui/unsaved-exit-alert-dialog/UnsavedExitAlertDialog';

interface OpenUnsavedExitDialogOptions {
  onConfirm: () => void;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
}

let isExitDialogOpen = false;

function openUnsavedExitDialog({
  onConfirm,
  title,
  description,
  cancelLabel,
  confirmLabel,
}: OpenUnsavedExitDialogOptions) {
  if (isExitDialogOpen) return;

  isExitDialogOpen = true;

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  requestAnimationFrame(() => {
    overlay.open(({ isOpen, close }) => {
      const handleClose = () => {
        isExitDialogOpen = false;
        close();
      };

      return (
        <UnsavedExitAlertDialog
          isOpen={isOpen}
          close={handleClose}
          onConfirm={() => {
            isExitDialogOpen = false;
            close();
            onConfirm();
          }}
          title={title}
          description={description}
          cancelLabel={cancelLabel}
          confirmLabel={confirmLabel}
        />
      );
    });
  });
}

export { openUnsavedExitDialog };
export type { OpenUnsavedExitDialogOptions };
