import type {
  GuardianKindergartenConnectionStatus,
  GuardianPendingKindergarten,
} from '../model/guardianKindergartenConnection';

/** API 연동 전 임시 테스트용 mock 유치원 (지도 검색: 도그포레 강아지유치원) */
const MOCK_PENDING_KINDERGARTEN: GuardianPendingKindergarten = {
  id: '1201415581',
  name: '도그포레 강아지유치원',
  address: '서울특별시 도봉구 창동 582-19 도그포레',
  imageUrl: '서울특별시/도봉구/1201415581/thumbnail_optimized.webp',
};

/**
 * API 연동 전 화면 상태: 'none' | 'pending'
 * 이 값만 바꿔서 테스트허면 됨
 */
const MOCK_CONNECTION_STATUS: GuardianKindergartenConnectionStatus = 'pending';

/** true면 화면 위 mock 스위치 UI 표시 */
const SHOW_CONNECTION_MOCK_SWITCHER = false;

export { MOCK_PENDING_KINDERGARTEN, MOCK_CONNECTION_STATUS, SHOW_CONNECTION_MOCK_SWITCHER };
