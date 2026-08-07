import { guardianDogSelectContent } from '../config/guardianDogSelectContent';
import type { GuardianKindergartenConnectionStatus } from '../model/guardianKindergartenConnection';

function getGuardianDogStatusBadge(status: GuardianKindergartenConnectionStatus): string | null {
  if (status === 'none') return guardianDogSelectContent.badgeUnlinked;
  if (status === 'pending') return guardianDogSelectContent.badgePending;
  return null;
}

export { getGuardianDogStatusBadge };
