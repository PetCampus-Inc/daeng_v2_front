/**
 * 신청 현황 조회 실패 UI 확인용.
 * - 이 값을 true로 바꾸거나
 * - 주소에 `?mock=error`를 붙이면 (배포 앱에서도 확인 가능)
 *
 * 신청 현황 조회 API가 붙으면 쿼리 에러 상태로 대체한다.
 */
const MOCK_APPLY_STATUS_ERROR = false;

const MOCK_APPLY_STATUS_ERROR_QUERY = 'error';

function isApplyStatusErrorMock(mockQuery: string | null) {
  return MOCK_APPLY_STATUS_ERROR || mockQuery === MOCK_APPLY_STATUS_ERROR_QUERY;
}

export { MOCK_APPLY_STATUS_ERROR, isApplyStatusErrorMock };
