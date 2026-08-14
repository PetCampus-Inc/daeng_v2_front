/**
 * 연결 해제 리스트(`여기까지 다녔어요`) 확인용 mock.
 *
 * home API `status`가 `disconnected`로 내려오기 전까지 화면만 확인할 때 사용한다.
 * - 상수를 true로 바꾸거나
 * - 주소에 `?mock=disconnected`를 붙이면 (배포 앱에서도 확인 가능)
 */
const MOCK_DISCONNECTED_LIST = false;

const MOCK_DISCONNECTED_QUERY = 'disconnected';

function isDisconnectedListMock(mockQuery: string | null) {
  return MOCK_DISCONNECTED_LIST || mockQuery === MOCK_DISCONNECTED_QUERY;
}

export { MOCK_DISCONNECTED_LIST, isDisconnectedListMock };
