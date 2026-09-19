import type { OwnerMemberConnectionHistoryItem } from '../model/ownerMemberConnectionHistory';

/**
 * 원장용 연결 이력 API 미제공 — UI 퍼블리싱용 mock.
 * 현재 조회 중인 원장 유치원 ↔ 해당 원생 연결 이력만 가정.
 */
const MOCK_OWNER_MEMBER_CONNECTION_HISTORY: OwnerMemberConnectionHistoryItem[] = [
  {
    id: 'owner-connection-current',
    connectedAt: '2025-12-06',
    disconnectedAt: null,
    attendanceDayCount: 24,
  },
  {
    id: 'owner-connection-past-1',
    connectedAt: '2025-07-09',
    disconnectedAt: '2025-11-28',
    attendanceDayCount: 53,
  },
];

export { MOCK_OWNER_MEMBER_CONNECTION_HISTORY };
