import {
  GUARDIAN_CONNECTION_APPLY_STATUS,
  type GuardianConnectionApplyStatus,
} from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatus';
import { GuardianConnectionApplyApprovedBadge } from '@views/guardian-connection-apply-status-page/ui/badges/GuardianConnectionApplyApprovedBadge';
import { GuardianConnectionApplyCancelledBadge } from '@views/guardian-connection-apply-status-page/ui/badges/GuardianConnectionApplyCancelledBadge';
import { GuardianConnectionApplyPendingBadge } from '@views/guardian-connection-apply-status-page/ui/badges/GuardianConnectionApplyPendingBadge';
import { GuardianConnectionApplyRejectedBadge } from '@views/guardian-connection-apply-status-page/ui/badges/GuardianConnectionApplyRejectedBadge';

interface GuardianConnectionApplyStatusBadgeProps {
  status: GuardianConnectionApplyStatus;
}

function GuardianConnectionApplyStatusBadge({ status }: GuardianConnectionApplyStatusBadgeProps) {
  switch (status) {
    case GUARDIAN_CONNECTION_APPLY_STATUS.PENDING:
      return <GuardianConnectionApplyPendingBadge />;
    case GUARDIAN_CONNECTION_APPLY_STATUS.REJECTED:
      return <GuardianConnectionApplyRejectedBadge />;
    case GUARDIAN_CONNECTION_APPLY_STATUS.APPROVED:
      return <GuardianConnectionApplyApprovedBadge />;
    case GUARDIAN_CONNECTION_APPLY_STATUS.CANCELLED:
      return <GuardianConnectionApplyCancelledBadge />;
    default:
      return null;
  }
}

export { GuardianConnectionApplyStatusBadge };
