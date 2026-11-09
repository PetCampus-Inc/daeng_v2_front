'use client';

import type { ReactNode } from 'react';

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

interface ReservationAlertDialogProps {
  isOpen: boolean;
  title: string;
  body: ReactNode;
  cancelLabel: string;
  confirmLabel: string;
  contentClassName?: string;
  descriptionClassName?: string;
  actionClassName?: string;
  onClose: () => void;
  onConfirm: () => void;
  children?: ReactNode;
}

function ReservationAlertDialog({
  isOpen,
  title,
  body,
  cancelLabel,
  confirmLabel,
  contentClassName,
  descriptionClassName,
  actionClassName,
  onClose,
  onConfirm,
  children,
}: ReservationAlertDialogProps) {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent className={contentClassName}>
        <AlertDialogHeader className='min-w-0'>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className={descriptionClassName}>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter className='min-w-0'>
          <AlertDialogCancel className={actionClassName}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            className={actionClassName}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ReservationAlertDialog };
