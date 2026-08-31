'use client';

import { useEffect } from 'react';
import { overlay } from 'overlay-kit';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@knockdog/ui';

import { ownerDailyNoticeWriteContent } from '@views/owner-daily-notice-write-page/config/ownerDailyNoticeWriteContent';

function openExpiredNoticeDialog(onConfirm: () => void) {
  return overlay.open(({ isOpen, close }) => (
    <AlertDialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && close()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{ownerDailyNoticeWriteContent.expiredTitle}</AlertDialogTitle>
          <AlertDialogDescription className='whitespace-pre-line'>
            {ownerDailyNoticeWriteContent.expiredDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => {
              close();
              onConfirm();
            }}
          >
            {ownerDailyNoticeWriteContent.expiredConfirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ));
}

function useExpiredNoticeDialog(isExpired: boolean, onConfirm: () => void) {
  useEffect(() => {
    if (!isExpired) return;

    const overlayId = openExpiredNoticeDialog(onConfirm);

    return () => {
      overlay.unmount(overlayId);
    };
  }, [isExpired, onConfirm]);
}

export { openExpiredNoticeDialog, useExpiredNoticeDialog };
