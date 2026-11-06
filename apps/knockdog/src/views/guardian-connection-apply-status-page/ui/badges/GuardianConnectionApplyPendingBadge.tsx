import { guardianConnectionApplyStatusContent } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusContent';

function GuardianConnectionApplyPendingBadge() {
  return (
    <span className='caption1-semibold bg-info-light text-info-bold inline-flex items-center justify-center rounded-full px-2 py-1 whitespace-nowrap'>
      {guardianConnectionApplyStatusContent.statusLabel.pending}
    </span>
  );
}

export { GuardianConnectionApplyPendingBadge };
