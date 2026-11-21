'use client';

import { ConfirmDialog } from '@shared/ui/confirm-dialog';

interface UnsavedExitAlertDialogProps {
  isOpen: boolean;
  close: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
}

/**
 * 저장하지 않고 나갈 때 묻는 확인창. 모양은 공통 ConfirmDialog(V4)를 쓴다.
 * 열고 닫는 순서와 뒤로가기 가드는 openUnsavedExitDialog가 맡는다.
 */
function UnsavedExitAlertDialog({
  isOpen,
  close,
  onConfirm,
  title,
  description,
  cancelLabel,
  confirmLabel,
}: UnsavedExitAlertDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={title}
      description={description}
      cancelLabel={cancelLabel}
      confirmLabel={confirmLabel}
      onClose={close}
      onConfirm={onConfirm}
    />
  );
}

export { UnsavedExitAlertDialog };
export type { UnsavedExitAlertDialogProps };
