import { guardianDogSelectContent } from '../config/guardianDogSelectContent';
import type { GuardianKindergartenConnectionStatus } from '../model/guardianKindergartenConnection';

function getGuardianDogStatusBadge(
  status: GuardianKindergartenConnectionStatus | null | undefined
): string | null {
  // 홈 조회 전/실패 시 잘못된 '등록 전' 뱃지 깜빡임 방지
  if (status == null) return null;
  if (status === 'none' || status === 'disconnected') return guardianDogSelectContent.badgeUnlinked;
  if (status === 'pending') return guardianDogSelectContent.badgePending;
  return null;
}

export { getGuardianDogStatusBadge };
