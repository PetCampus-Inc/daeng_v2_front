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

import { openConfirmDialog } from '@shared/lib/bridge';
import { ownerAlbumContent } from '@views/owner-album-page/config/ownerAlbumContent';

interface OwnerAlbumAlertDialogProps {
  isOpen: boolean;
  close: () => void;
  title: string;
  description: string;
}

function OwnerAlbumAlertDialog({ isOpen, close, title, description }: OwnerAlbumAlertDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={close}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className='w-full' onClick={close}>
            {ownerAlbumContent.upload.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function openWebAlbumAlert(title: string, description: string) {
  overlay.open(({ isOpen, close }) => (
    <OwnerAlbumAlertDialog isOpen={isOpen} close={close} title={title} description={description} />
  ));
}

/** 업로드 로딩 모달이 내려간 뒤 띄워서 딤 오버레이가 가려지지 않게 함 */
function openOwnerAlbumAlert(title: string, description: string) {
  setTimeout(async () => {
    const result = await openConfirmDialog({
      title,
      description,
      confirmLabel: ownerAlbumContent.upload.confirmLabel,
      showCancelButton: false,
    });

    if (result.status === 'unavailable') openWebAlbumAlert(title, description);
  }, 0);
}

export { openOwnerAlbumAlert };
