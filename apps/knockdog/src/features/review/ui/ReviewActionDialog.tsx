'use client';

import { useEffect, useRef, type MouseEvent } from 'react';
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

import { ActionLoadingOverlay } from '@shared/ui/loading-spinner';

interface ReviewActionDialogProps {
  isOpen: boolean;
  isSubmitting: boolean;
  title: string;
  description: string;
  hideDescription?: boolean;
  cancelLabel: string;
  confirmLabel: string;
  closeOnOutside?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function preventWhileSubmitting(isSubmitting: boolean, onConfirm: () => void) {
  return (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    onConfirm();
  };
}

function ReviewActionDialog({
  isOpen,
  isSubmitting,
  title,
  description,
  hideDescription = false,
  cancelLabel,
  confirmLabel,
  closeOnOutside = false,
  onClose,
  onConfirm,
}: ReviewActionDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || isSubmitting || !closeOnOutside) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || contentRef.current?.contains(target)) return;
      onClose();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [closeOnOutside, isOpen, isSubmitting, onClose]);

  return (
    <AlertDialog
      open={isOpen}
      closeOnNativeBack={!isSubmitting}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <AlertDialogContent ref={contentRef}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className={hideDescription ? 'sr-only' : undefined}>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction disabled={isSubmitting} onClick={preventWhileSubmitting(isSubmitting, onConfirm)}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
        <ActionLoadingOverlay isPending={isSubmitting} />
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ReviewActionDialog };
