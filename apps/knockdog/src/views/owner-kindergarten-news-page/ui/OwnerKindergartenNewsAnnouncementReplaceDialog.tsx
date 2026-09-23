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

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';

interface OwnerKindergartenNewsAnnouncementReplaceDialogProps {
  isOpen: boolean;
  close: () => void;
  onConfirm: () => void;
}

/** 이미 공지가 있을 때 공지 토글 ON 확인 */
function OwnerKindergartenNewsAnnouncementReplaceDialog({
  isOpen,
  close,
  onConfirm,
}: OwnerKindergartenNewsAnnouncementReplaceDialogProps) {
  const { announcementReplaceDialog } = ownerKindergartenNewsContent.write;

  const handleOpenChange = (open: boolean) => {
    if (!open) close();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange} closeOnNativeBack={false}>
      <AlertDialogContent className='max-w-[358px]'>
        <AlertDialogHeader className='px-x4'>
          <AlertDialogTitle>{announcementReplaceDialog.title}</AlertDialogTitle>
          <AlertDialogDescription className='whitespace-pre-line'>
            {announcementReplaceDialog.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='px-x4'>
          <AlertDialogCancel className='body1-bold text-text-secondary'>
            {announcementReplaceDialog.cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            className='body1-bold'
            onClick={() => {
              onConfirm();
              close();
            }}
          >
            {announcementReplaceDialog.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { OwnerKindergartenNewsAnnouncementReplaceDialog };
