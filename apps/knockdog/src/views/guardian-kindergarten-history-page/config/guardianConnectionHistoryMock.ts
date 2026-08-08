import type { GuardianConnectionHistoryItem } from '../model/guardianConnectionHistory';

/** mock 공통 썸네일 (실제 S3 키) */
const MOCK_THUMBNAIL = '서울특별시/도봉구/1201415581/thumbnail_optimized.webp';

/**
 * API 연동 전 연결 이력 mock.
 * 동일 유치원이라도 재원 기간이 다르면 별도 카드.
 */
const MOCK_CONNECTION_HISTORY: GuardianConnectionHistoryItem[] = [
  {
    id: 'history-momo-current',
    kindergartenId: 'momo',
    name: '모모네 유치원',
    address: '충남 태안군 안면읍 해안관광로 954-51',
    imageUrl: MOCK_THUMBNAIL,
    connectedAt: '2025-12-06',
    disconnectedAt: null,
    attendanceDayCount: 24,
  },
  {
    id: 'history-nuri-2',
    kindergartenId: 'nuri',
    name: '누리 애견 유치원',
    address: '서울특별시 강서구 까치산로 75',
    imageUrl: MOCK_THUMBNAIL,
    connectedAt: '2025-07-09',
    disconnectedAt: '2025-11-28',
    attendanceDayCount: 153,
  },
  {
    id: 'history-forest',
    kindergartenId: 'forest',
    name: '풀숲 강아지 유치원',
    address: '서울특별시 관악구 봉천로17가길 3',
    imageUrl: MOCK_THUMBNAIL,
    connectedAt: '2025-03-12',
    disconnectedAt: '2025-06-30',
    attendanceDayCount: 124,
  },
  {
    id: 'history-nuri-1',
    kindergartenId: 'nuri',
    name: '누리 애견 유치원',
    address: '서울특별시 강서구 까치산로 75',
    imageUrl: MOCK_THUMBNAIL,
    connectedAt: '2025-01-05',
    disconnectedAt: '2025-03-01',
    attendanceDayCount: 58,
  },
];

export { MOCK_CONNECTION_HISTORY };
