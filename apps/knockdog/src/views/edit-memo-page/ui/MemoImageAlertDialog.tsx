'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { editMemoContent } from '@views/edit-memo-page/config/editMemoContent';

import { openConfirmDialog } from '@shared/lib/bridge';

const { confirmLabel } = editMemoContent.imageUpload;

function openWebImageAlert(title: string, description: string) {
  overlay.open(({ isOpen, close }) => (
    <AlertDialog open={isOpen} onOpenChange={close}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className='w-full' onClick={close}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ));
}

/** 네이티브 confirm → 웹 AlertDialog 폴백 */
function openMemoImageAlert(title: string, description: string) {
  setTimeout(async () => {
    const result = await openConfirmDialog({ title, description, confirmLabel, showCancelButton: false });
    if (result.status === 'unavailable') openWebImageAlert(title, description);
  }, 0);
}

export { openMemoImageAlert };
