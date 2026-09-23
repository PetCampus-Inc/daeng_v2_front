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

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';
import { openConfirmDialog } from '@shared/lib/bridge';

interface OwnerKindergartenNewsImageAlertDialogProps {
  isOpen: boolean;
  close: () => void;
  title: string;
  description: string;
}

function OwnerKindergartenNewsImageAlertDialog({
  isOpen,
  close,
  title,
  description,
}: OwnerKindergartenNewsImageAlertDialogProps) {
  const { confirmLabel } = ownerKindergartenNewsContent.write.imageUpload;

  return (
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
  );
}

function openWebImageAlert(title: string, description: string) {
  overlay.open(({ isOpen, close }) => (
    <OwnerKindergartenNewsImageAlertDialog
      isOpen={isOpen}
      close={close}
      title={title}
      description={description}
    />
  ));
}

/** 네이티브 confirm → 웹 AlertDialog 폴백 */
function openOwnerKindergartenNewsImageAlert(title: string, description: string) {
  setTimeout(async () => {
    const result = await openConfirmDialog({
      title,
      description,
      confirmLabel: ownerKindergartenNewsContent.write.imageUpload.confirmLabel,
      showCancelButton: false,
    });

    if (result.status === 'unavailable') openWebImageAlert(title, description);
  }, 0);
}

export { openOwnerKindergartenNewsImageAlert };
