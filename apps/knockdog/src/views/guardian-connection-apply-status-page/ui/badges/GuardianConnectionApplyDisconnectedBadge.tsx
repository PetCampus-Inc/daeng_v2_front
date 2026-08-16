import { guardianConnectionApplyStatusContent } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusContent';

function GuardianConnectionApplyDisconnectedBadge() {
  return (
    <span className='caption1-semibold bg-bg-100 text-text-secondary inline-flex items-center justify-center rounded-full px-2 py-1 whitespace-nowrap'>
      {guardianConnectionApplyStatusContent.statusLabel.disconnected}
    </span>
  );
}

export { GuardianConnectionApplyDisconnectedBadge };
