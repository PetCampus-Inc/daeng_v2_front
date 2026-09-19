import type { OwnerMemberConnectionHistoryItem } from '../model/ownerMemberConnectionHistory';

/**
 * 현재 연결 우선 → 과거는 최근 연결(해제일 기준)부터.
 * 보호자 유치원 연결 이력 정렬과 동일.
 */
function sortOwnerMemberConnectionHistory(
  items: OwnerMemberConnectionHistoryItem[]
): OwnerMemberConnectionHistoryItem[] {
  return [...items].sort((a, b) => {
    const aActive = a.disconnectedAt == null ? 0 : 1;
    const bActive = b.disconnectedAt == null ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;

    const aKey = a.disconnectedAt ?? a.connectedAt;
    const bKey = b.disconnectedAt ?? b.connectedAt;
    return bKey.localeCompare(aKey);
  });
}

export { sortOwnerMemberConnectionHistory };
