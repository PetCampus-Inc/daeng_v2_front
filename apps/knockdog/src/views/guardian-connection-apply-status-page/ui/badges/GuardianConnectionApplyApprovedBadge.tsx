import { guardianConnectionApplyStatusContent } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusContent';

function GuardianConnectionApplyApprovedBadge() {
  return (
    <span className='caption1-semibold bg-success-light text-success-bold inline-flex items-center justify-center rounded-full px-2 py-1 whitespace-nowrap'>
      {guardianConnectionApplyStatusContent.statusLabel.approved}
    </span>
  );
}

export { GuardianConnectionApplyApprovedBadge };
