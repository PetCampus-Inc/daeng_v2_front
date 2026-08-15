import {
  GUARDIAN_CONNECTION_APPLY_GENDER,
  GUARDIAN_CONNECTION_APPLY_STATUS,
  type GuardianConnectionApplyItem,
} from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatus';

/**
 * 신청 현황 mock 모드.
 * - 기본: 리스트 (`?mock=list` 또는 mock 플래그)
 * - 빈 목록: `?mock=empty`
 * - 조회 실패: `?mock=error`
 */
const MOCK_APPLY_STATUS_LIST = true;

const MOCK_APPLY_STATUS_QUERY = {
  list: 'list',
  empty: 'empty',
  error: 'error',
} as const;

function isApplyStatusErrorMock(mockQuery: string | null) {
  return mockQuery === MOCK_APPLY_STATUS_QUERY.error;
}

function isApplyStatusEmptyMock(mockQuery: string | null) {
  return mockQuery === MOCK_APPLY_STATUS_QUERY.empty;
}

function isApplyStatusListMock(mockQuery: string | null) {
  if (isApplyStatusErrorMock(mockQuery) || isApplyStatusEmptyMock(mockQuery)) return false;
  return MOCK_APPLY_STATUS_LIST || mockQuery === MOCK_APPLY_STATUS_QUERY.list;
}

/**
 * - 동일 플로우의 강아지도 개별 카드
 * - appliedAt 내림차순 정렬 전제 (페이지에서 재정렬)
 */
const MOCK_CONNECTION_APPLY_ITEMS: GuardianConnectionApplyItem[] = [
  {
    id: 'apply-1',
    status: GUARDIAN_CONNECTION_APPLY_STATUS.PENDING,
    appliedAt: '2026-07-28T15:59:00',
    pet: {
      id: 'pet-1',
      name: '호두',
      gender: GUARDIAN_CONNECTION_APPLY_GENDER.MALE,
      breed: '비숑',
    },
    kindergartenName: '고고곡 유치원',
  },
  {
    id: 'apply-2',
    status: GUARDIAN_CONNECTION_APPLY_STATUS.REJECTED,
    appliedAt: '2026-07-28T15:59:00',
    pet: {
      id: 'pet-1',
      name: '호두',
      gender: GUARDIAN_CONNECTION_APPLY_GENDER.MALE,
      breed: '비숑',
    },
    kindergartenName: '고고곡 유치원',
  },
  {
    id: 'apply-3',
    status: GUARDIAN_CONNECTION_APPLY_STATUS.APPROVED,
    appliedAt: '2026-07-28T15:58:00',
    pet: {
      id: 'pet-1',
      name: '호두',
      gender: GUARDIAN_CONNECTION_APPLY_GENDER.MALE,
      breed: '비숑',
    },
    kindergartenName: '코코스퀘어 강아지유치원&애견미용 플래그십 스토어',
  },
  {
    id: 'apply-4',
    status: GUARDIAN_CONNECTION_APPLY_STATUS.CANCELLED,
    appliedAt: '2025-12-31T18:59:00',
    pet: {
      id: 'pet-2',
      name: '뽀삐',
      gender: GUARDIAN_CONNECTION_APPLY_GENDER.MALE,
      breed: '닥스훈트',
    },
    kindergartenName: '도도도독 유치원',
  },
];

export {
  MOCK_APPLY_STATUS_LIST,
  MOCK_CONNECTION_APPLY_ITEMS,
  isApplyStatusEmptyMock,
  isApplyStatusErrorMock,
  isApplyStatusListMock,
};
