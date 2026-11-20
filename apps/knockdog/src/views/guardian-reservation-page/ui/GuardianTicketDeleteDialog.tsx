'use client';

import { ConfirmDialog } from '@shared/ui/confirm-dialog';

/** 보호자 이용권 삭제 확인창 문구. 앱 확인창과 웹 확인창이 같이 쓴다. */
const TICKET_DELETE_DIALOG = {
  title: '이용권을 삭제할까요?',
  description: '이용권 목록에서 사라지고\n이용권 내역을 더 이상 볼 수 없어요.',
  cancelLabel: '닫기',
  confirmLabel: '삭제',
};

interface GuardianTicketDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** 이용권 삭제 웹 확인창 */
function GuardianTicketDeleteDialog({ isOpen, onClose, onConfirm }: GuardianTicketDeleteDialogProps) {
  return <ConfirmDialog {...TICKET_DELETE_DIALOG} isOpen={isOpen} onClose={onClose} onConfirm={onConfirm} />;
}

export { GuardianTicketDeleteDialog, TICKET_DELETE_DIALOG };
