import type { GuardianConnectionHistoryItem } from '../model/guardianConnectionHistory';

/**
 * 현재 연결 우선 → 그 외 최신순.
 * 최신 기준: 연결 중은 connectedAt, 해제된 건은 disconnectedAt.
 */
function sortGuardianConnectionHistory(
  items: GuardianConnectionHistoryItem[]
): GuardianConnectionHistoryItem[] {
  return [...items].sort((a, b) => {
    const aActive = a.disconnectedAt == null ? 0 : 1;
    const bActive = b.disconnectedAt == null ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;

    const aKey = a.disconnectedAt ?? a.connectedAt;
    const bKey = b.disconnectedAt ?? b.connectedAt;
    return bKey.localeCompare(aKey);
  });
}

export { sortGuardianConnectionHistory };
