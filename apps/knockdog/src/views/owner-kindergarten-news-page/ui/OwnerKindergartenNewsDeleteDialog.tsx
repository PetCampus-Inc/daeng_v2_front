'use client';

import { useState } from 'react';
import { overlay } from 'overlay-kit';
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
import { toast } from '@shared/ui/toast';

interface OwnerKindergartenNewsDeleteDialogProps {
  isOpen: boolean;
  close: () => void;
  onConfirm: () => void | Promise<void>;
}

function OwnerKindergartenNewsDeleteDialog({
  isOpen,
  close,
  onConfirm,
}: OwnerKindergartenNewsDeleteDialogProps) {
  const { deleteDialog } = ownerKindergartenNewsContent;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) close();
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm();
      close();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange} closeOnNativeBack={false}>
      <AlertDialogContent className='max-w-[358px]'>
        <AlertDialogHeader className='px-x4'>
          <AlertDialogTitle>{deleteDialog.title}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter className='px-x4'>
          <AlertDialogCancel disabled={isSubmitting} className='body1-bold text-text-secondary'>
            {deleteDialog.cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            className='body1-bold'
            onClick={() => {
              void handleConfirm();
            }}
          >
            {deleteDialog.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function showOwnerKindergartenNewsDeleteSuccessToast() {
  const { deleteSuccessToast } = ownerKindergartenNewsContent;

  toast({
    type: 'success',
    nativeTitle: deleteSuccessToast.nativeTitle,
    titleParts: [
      { text: '유치원 소식을 ' },
      { text: '삭제', accent: true },
      { text: '했어요' },
    ],
    title: (
      <>
        <span className='text-text-primary-inverse'>유치원 소식을 </span>
        <span className='text-text-accent'>삭제</span>
        <span className='text-text-primary-inverse'>했어요</span>
      </>
    ),
  });
}

function openOwnerKindergartenNewsDeleteDialog(onConfirm: () => void | Promise<void>) {
  overlay.open(({ isOpen, close }) => (
    <OwnerKindergartenNewsDeleteDialog isOpen={isOpen} close={close} onConfirm={onConfirm} />
  ));
}

export {
  OwnerKindergartenNewsDeleteDialog,
  openOwnerKindergartenNewsDeleteDialog,
  showOwnerKindergartenNewsDeleteSuccessToast,
};
