'use client';

import { overlay } from 'overlay-kit';
import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';
import { openConfirmDialog } from '@shared/lib/bridge';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';
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

  /** 확인창을 바로 닫고 삭제 요청을 시작한다 */
  const handleConfirm = () => {
    close();
    void runDelete(onConfirm);
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={deleteDialog.title}
      cancelLabel={deleteDialog.cancelLabel}
      confirmLabel={deleteDialog.confirmLabel}
      onClose={close}
      onConfirm={handleConfirm}
    />
  );
}

function showOwnerKindergartenNewsDeleteSuccessToast() {
  const { deleteSuccessToast } = ownerKindergartenNewsContent;

  toast({
    type: 'success',
    nativeTitle: deleteSuccessToast.nativeTitle,
    titleParts: [
      { text: '유치원 소식을 ' },
      { text: '삭제', bold: true },
      { text: '했어요' },
    ],
    title: (
      <>
        <span className='text-text-primary-inverse'>유치원 소식을 </span>
        <span className='body1-bold text-text-primary-inverse'>삭제</span>
        <span className='text-text-primary-inverse'>했어요</span>
      </>
    ),
  });
}

function showNewsDeleteFailedToast() {
  const { deleteFailedToast } = ownerKindergartenNewsContent;

  toast({
    nativeTitle: deleteFailedToast.nativeTitle,
    titleParts: [
      { text: '소식을 ' },
      { text: '삭제', bold: true },
      { text: '하지 못했어요' },
    ],
    title: (
      <>
        <span className='text-text-primary-inverse'>소식을 </span>
        <span className='body1-bold text-text-primary-inverse'>삭제</span>
        <span className='text-text-primary-inverse'>하지 못했어요</span>
      </>
    ),
  });
}

/** 삭제 요청을 보내고, 실패하면 실패 토스트로 알린다 */
async function runDelete(onConfirm: () => void | Promise<void>) {
  try {
    await onConfirm();
  } catch {
    showNewsDeleteFailedToast();
  }
}

/** 소식 삭제 확인창을 연다. 앱에서는 앱 확인창을 먼저 시도하고, 쓸 수 없으면 웹 확인창을 띄운다. */
async function openOwnerKindergartenNewsDeleteDialog(onConfirm: () => void | Promise<void>) {
  const { deleteDialog } = ownerKindergartenNewsContent;
  const result = await openConfirmDialog({
    title: deleteDialog.title,
    cancelLabel: deleteDialog.cancelLabel,
    confirmLabel: deleteDialog.confirmLabel,
  });
  if (result.status === 'resolved') {
    if (result.action === 'confirm') void runDelete(onConfirm);
    return;
  }
  if (result.status === 'pending') return;

  overlay.open(({ isOpen, close }) => (
    <OwnerKindergartenNewsDeleteDialog isOpen={isOpen} close={close} onConfirm={onConfirm} />
  ));
}

export {
  OwnerKindergartenNewsDeleteDialog,
  openOwnerKindergartenNewsDeleteDialog,
  showOwnerKindergartenNewsDeleteSuccessToast,
};
