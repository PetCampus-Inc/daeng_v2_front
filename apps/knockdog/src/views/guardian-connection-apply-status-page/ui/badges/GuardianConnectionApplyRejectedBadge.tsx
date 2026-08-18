import { guardianConnectionApplyStatusContent } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusContent';

function GuardianConnectionApplyRejectedBadge() {
  return (
    <span className='caption1-semibold bg-error-light text-error-bold inline-flex items-center justify-center rounded-full px-2 py-1 whitespace-nowrap'>
      {guardianConnectionApplyStatusContent.statusLabel.rejected}
    </span>
  );
}

export { GuardianConnectionApplyRejectedBadge };
