'use client';

import { useState } from 'react';
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

import { notificationInboxContent } from '@views/notification-inbox-page/config/notificationInboxContent';

interface NotificationInboxMarkAllReadDialogProps {
  isOpen: boolean;
  close: () => void;
  onConfirm: () => Promise<void>;
}

function NotificationInboxMarkAllReadDialog({
  isOpen,
  close,
  onConfirm,
}: NotificationInboxMarkAllReadDialogProps) {
  const { markAllReadDialog } = notificationInboxContent;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) close();
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onConfirm();
      close();
    } catch {
      close();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{markAllReadDialog.title}</AlertDialogTitle>
          <AlertDialogDescription className='whitespace-pre-line'>
            {markAllReadDialog.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>{markAllReadDialog.cancelLabel}</AlertDialogCancel>
          <AlertDialogAction disabled={isSubmitting} onClick={() => void handleConfirm()}>
            {markAllReadDialog.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { NotificationInboxMarkAllReadDialog };
