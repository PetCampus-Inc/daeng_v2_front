type OwnerMemberTicketState = 'NONE' | 'VALID' | 'EXPIRING' | 'EXPIRED';
type OwnerMemberExpiringReason = 'REMAINING_ONE' | 'DAYS_LEFT';

interface OwnerMemberStatusBadgeSource {
  ticketState: OwnerMemberTicketState;
  expiringReason: OwnerMemberExpiringReason | null;
  /** 대표 이용권의 남은 일수. 만료일이 없거나 이용권이 없으면 null */
  daysLeft: number | null;
}

/**
 * 등록 원생 한 줄에 붙는 상태 배지 문구를 만든다.
 * 만료예정·만료 판정은 서버가 하고, 여기서는 서버 값을 문구로 바꾸기만 한다.
 * 배지가 없으면 null을 돌려준다.
 */
function toOwnerMemberStatusBadge({
  ticketState,
  expiringReason,
  daysLeft,
}: OwnerMemberStatusBadgeSource): string | null {
  if (ticketState === 'EXPIRED') return '만료';
  if (ticketState !== 'EXPIRING') return null;

  if (expiringReason === 'REMAINING_ONE') return '1회 남음';
  if (expiringReason === 'DAYS_LEFT' && daysLeft != null) return `D-${daysLeft}`;

  return null;
}

export { toOwnerMemberStatusBadge };
export type { OwnerMemberExpiringReason, OwnerMemberStatusBadgeSource, OwnerMemberTicketState };
