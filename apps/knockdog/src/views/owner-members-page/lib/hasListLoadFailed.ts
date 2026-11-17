interface ListQueryState {
  isError: boolean;
  data: unknown;
  errorUpdateCount: number;
}

/**
 * 목록 조회가 실패한 상태인지 알려준다.
 * 실패 뒤 다시 시도하는 동안 react-query가 상태를 `pending`으로 되돌려도,
 * 불러온 데이터 없이 실패한 적이 있으면 오류 화면을 유지해 `다시 시도하기` 버튼만 잠근다.
 */
function hasListLoadFailed({ isError, data, errorUpdateCount }: ListQueryState) {
  return isError || (data === undefined && errorUpdateCount > 0);
}

export { hasListLoadFailed };
