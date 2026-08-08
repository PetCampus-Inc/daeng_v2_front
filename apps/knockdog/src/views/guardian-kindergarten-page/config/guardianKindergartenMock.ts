import type {
  GuardianKindergartenConnectionStatus,
  GuardianLinkedKindergarten,
} from '../model/guardianKindergartenConnection';

/** API 연동 전 임시 테스트용 mock 유치원 (지도 검색: 도그포레 강아지유치원) */
const MOCK_LINKED_KINDERGARTEN: GuardianLinkedKindergarten = {
  id: '1201415581',
  name: '도그포레 강아지유치원',
  address: '서울특별시 도봉구 창동 582-19 도그포레',
  imageUrl: '서울특별시/도봉구/1201415581/thumbnail_optimized.webp',
};

/**
 * API 연동 전 화면 상태: 'none' | 'pending' | 'approved' | 'disconnected'
 * 대표견 기본값. 스위치 ON이면 화면 위 connection 버튼이 우선
 */
const MOCK_CONNECTION_STATUS: GuardianKindergartenConnectionStatus = 'approved';

/**
 * 강아지별 연결 상태 mock (이름 키).
 * 미지정 시: 대표견 → MOCK_CONNECTION_STATUS, 그 외 → 'none'
 */
const MOCK_PET_CONNECTION_BY_NAME: Record<string, GuardianKindergartenConnectionStatus> = {
  // 예: 흑미: 'pending', 파트라슈: 'none'
};

/** true면 화면 위 mock 스위치 UI 표시. false여도 저장된 override는 계속 적용 */
const SHOW_CONNECTION_MOCK_SWITCHER = false;

export {
  MOCK_LINKED_KINDERGARTEN,
  MOCK_CONNECTION_STATUS,
  MOCK_PET_CONNECTION_BY_NAME,
  SHOW_CONNECTION_MOCK_SWITCHER,
};