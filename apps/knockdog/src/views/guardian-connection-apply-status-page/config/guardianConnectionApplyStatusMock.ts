import {
  GUARDIAN_CONNECTION_APPLY_GENDER,
  GUARDIAN_CONNECTION_APPLY_STATUS,
  type GuardianConnectionApplyItem,
} from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatus';

/**
 * 신청 현황 mock 모드 (실 API 기본).
 * - `?mock=empty` → empty
 * - `?mock=error` → PageError
 * - `?mock=list` → MOCK_CONNECTION_APPLY_ITEMS
 * - `?mock=cancel-fail` → 신청 취소 실패 (목록 유지 + 토스트)
 */
const MOCK_APPLY_STATUS_LIST = false;

/** true면 신청 취소 API가 항상 실패하는 것으로 처리 */
const MOCK_APPLY_CANCEL_FAIL = false;

const MOCK_APPLY_STATUS_QUERY = {
  list: 'list',
  empty: 'empty',
  error: 'error',
  cancelFail: 'cancel-fail',
} as const;

function isApplyStatusErrorMock(mockQuery: string | null) {
  return mockQuery === MOCK_APPLY_STATUS_QUERY.error;
}

function isApplyStatusEmptyMock(mockQuery: string | null) {
  return mockQuery === MOCK_APPLY_STATUS_QUERY.empty;
}

function isApplyCancelFailMock(mockQuery: string | null) {
  return MOCK_APPLY_CANCEL_FAIL || mockQuery === MOCK_APPLY_STATUS_QUERY.cancelFail;
}

function isApplyStatusListMock(mockQuery: string | null) {
  return mockQuery === MOCK_APPLY_STATUS_QUERY.list || MOCK_APPLY_STATUS_LIST;
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
    cancellable: true,
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
    cancellable: false,
  },
  {
    id: 'apply-3',
    status: GUARDIAN_CONNECTION_APPLY_STATUS.ACTIVE,
    appliedAt: '2026-07-28T15:58:00',
    pet: {
      id: 'pet-1',
      name: '호두',
      gender: GUARDIAN_CONNECTION_APPLY_GENDER.MALE,
      breed: '비숑',
    },
    kindergartenName: '코코스퀘어 강아지유치원&애견미용 플래그십 스토어',
    cancellable: false,
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
    cancellable: false,
  },
  {
    id: 'apply-5',
    status: GUARDIAN_CONNECTION_APPLY_STATUS.DISCONNECTED,
    appliedAt: '2025-11-01T10:00:00',
    pet: {
      id: 'pet-2',
      name: '뽀삐',
      gender: GUARDIAN_CONNECTION_APPLY_GENDER.MALE,
      breed: '닥스훈트',
    },
    kindergartenName: '도도도독 유치원',
    cancellable: false,
  },
];

export {
  MOCK_APPLY_STATUS_LIST,
  MOCK_APPLY_CANCEL_FAIL,
  MOCK_CONNECTION_APPLY_ITEMS,
  isApplyCancelFailMock,
  isApplyStatusEmptyMock,
  isApplyStatusErrorMock,
  isApplyStatusListMock,
};
