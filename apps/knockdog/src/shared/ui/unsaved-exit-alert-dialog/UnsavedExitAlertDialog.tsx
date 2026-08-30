'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@knockdog/ui';

import { useNativeBackToClose } from '@shared/lib/bridge';

interface UnsavedExitAlertDialogProps {
  isOpen: boolean;
  close: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
}

function UnsavedExitAlertDialog({
  isOpen,
  close,
  onConfirm,
  title,
  description,
  cancelLabel,
  confirmLabel,
}: UnsavedExitAlertDialogProps) {
  useNativeBackToClose(isOpen, close);

  return (
    <AlertDialog open={isOpen} onOpenChange={close}>
      <AlertDialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { UnsavedExitAlertDialog };
export type { UnsavedExitAlertDialogProps };
