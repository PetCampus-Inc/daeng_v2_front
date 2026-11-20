'use client';

import { memberTicketChargeContent } from '@views/owner/member-ticket-charge/config/memberTicketChargeContent';

import { ConfirmDialog } from '@shared/ui/confirm-dialog';

interface TicketChargeLeaveDialogProps {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
}

/** 이용권 충전을 마치지 않고 나갈 때 묻는 웹 확인창 */
function TicketChargeLeaveDialog({ isOpen, onStay, onLeave }: TicketChargeLeaveDialogProps) {
  const { leave } = memberTicketChargeContent;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={leave.title}
      description={leave.description}
      cancelLabel={leave.stay}
      confirmLabel={leave.exit}
      onClose={onStay}
      onConfirm={onLeave}
    />
  );
}

export { TicketChargeLeaveDialog };
