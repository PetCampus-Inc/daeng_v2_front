import { guardianConnectionApplyStatusContent } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatusContent';
import { truncateKindergartenName } from '@features/role-conversion/lib/formatKindergartenRegisterField';

/** `YYYY. MM. DD. HH:MM 신청` (24h) */
function formatApplyRequestedAt(isoDateTime: string) {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}. ${month}. ${day}. ${hours}:${minutes} ${guardianConnectionApplyStatusContent.appliedAtSuffix}`;
}

export { formatApplyRequestedAt, truncateKindergartenName };
