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

interface DeleteDialogProps {
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

function DeleteConfirmDialog({
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || isSubmitting) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || contentRef.current?.contains(target)) return;
      onClose();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, isSubmitting, onClose]);

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
          <AlertDialogTitle>해당 리뷰를 삭제할까요?</AlertDialogTitle>
          <AlertDialogDescription className='sr-only'>삭제한 리뷰는 복구할 수 없습니다.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>닫기</AlertDialogCancel>
          <AlertDialogAction disabled={isSubmitting} onClick={preventWhileSubmitting(isSubmitting, onConfirm)}>
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
        <ActionLoadingOverlay isPending={isSubmitting} />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteFailureDialog({
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteDialogProps) {
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
          <AlertDialogTitle>리뷰를 삭제하지 못했어요</AlertDialogTitle>
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

function KnockdogReviewDeleteDialogs({
  dialog,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  dialog: 'confirm' | 'failure' | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <DeleteConfirmDialog
        isOpen={dialog === 'confirm'}
        isSubmitting={isSubmitting}
        onClose={onClose}
        onConfirm={onConfirm}
      />
      <DeleteFailureDialog
        isOpen={dialog === 'failure'}
        isSubmitting={isSubmitting}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </>
  );
}

export { KnockdogReviewDeleteDialogs };
