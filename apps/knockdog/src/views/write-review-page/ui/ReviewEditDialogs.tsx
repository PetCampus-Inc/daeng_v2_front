'use client';

import type { MouseEvent } from 'react';
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

interface ReviewEditDialogProps {
  isOpen: boolean;
  isSubmitting: boolean;
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

function ReviewEditConfirmDialog({ isOpen, isSubmitting, onClose, onConfirm }: ReviewEditDialogProps) {
  return (
    <AlertDialog
      open={isOpen}
      closeOnNativeBack={!isSubmitting}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>리뷰를 수정할까요?</AlertDialogTitle>
          <AlertDialogDescription className='sr-only'>수정한 리뷰를 저장합니다.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>아니요</AlertDialogCancel>
          <AlertDialogAction disabled={isSubmitting} onClick={preventWhileSubmitting(isSubmitting, onConfirm)}>
            네
          </AlertDialogAction>
        </AlertDialogFooter>
        <ActionLoadingOverlay isPending={isSubmitting} />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ReviewEditFailureDialog({ isOpen, isSubmitting, onClose, onConfirm }: ReviewEditDialogProps) {
  return (
    <AlertDialog
      open={isOpen}
      closeOnNativeBack={!isSubmitting}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>리뷰를 수정하지 못했어요</AlertDialogTitle>
          <AlertDialogDescription>잠시 후 다시 시도해 주세요.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>닫기</AlertDialogCancel>
          <AlertDialogAction disabled={isSubmitting} onClick={preventWhileSubmitting(isSubmitting, onConfirm)}>
            다시 시도
          </AlertDialogAction>
        </AlertDialogFooter>
        <ActionLoadingOverlay isPending={isSubmitting} />
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ReviewEditConfirmDialog, ReviewEditFailureDialog };
