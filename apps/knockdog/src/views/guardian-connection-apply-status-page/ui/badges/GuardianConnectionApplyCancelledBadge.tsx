import { guardianConnectionApplyStatusContent } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusContent';

function GuardianConnectionApplyCancelledBadge() {
  return (
    <span className='caption1-semibold bg-bg-100 text-text-secondary inline-flex items-center justify-center rounded-full px-2 py-1 whitespace-nowrap'>
      {guardianConnectionApplyStatusContent.statusLabel.cancelled}
    </span>
  );
}

export { GuardianConnectionApplyCancelledBadge };
