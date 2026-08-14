/**
 * 연결 해제 리스트(`여기까지 다녔어요`) 확인용 mock.
 *
 * - 상수를 true로 바꾸거나
 * - 주소에 `?mock=disconnected`를 붙이면 (배포 앱에서도 확인 가능)
 *
 * mock 모드에서만 유치원 선택 mock 목록·연결 해제 블록 폴백을 켠다.
 */
const MOCK_DISCONNECTED_LIST = false;

const MOCK_DISCONNECTED_QUERY = 'disconnected';

function isDisconnectedListMock(mockQuery: string | null) {
  return MOCK_DISCONNECTED_LIST || mockQuery === MOCK_DISCONNECTED_QUERY;
}

export { MOCK_DISCONNECTED_LIST, isDisconnectedListMock };
