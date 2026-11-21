'use client';

import { memberTicketDetailContent } from '@views/owner/member-ticket-detail/config/memberTicketDetailContent';

import { ConfirmDialog } from '@shared/ui/confirm-dialog';

interface TicketConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}

/** 이용권 삭제·홀딩 취소를 묻는 웹 확인창 */
function TicketConfirmDialog({ isOpen, title, description, confirmLabel, onClose, onConfirm }: TicketConfirmDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={title}
      description={description}
      cancelLabel={memberTicketDetailContent.close}
      confirmLabel={confirmLabel}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

export { TicketConfirmDialog };
