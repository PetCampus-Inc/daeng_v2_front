import { HTTPError } from 'ky';

import { ApiError } from '../model/error';
import { isTimeoutError } from './isTimeoutError';

/** 브라우저별로 다른 fetch 네트워크 실패 문구 (Chrome, Safari, Firefox, React Native) */
const FETCH_FAILURE_MESSAGE_PATTERN = /failed to fetch|load failed|networkerror|network request failed/i;

/**
 * 인터넷 연결 문제로 요청이 서버에 닿지 못했는지 판별한다.
 *
 * 서버가 응답한 오류(`ApiError`, `HTTPError`)와 시간 초과는 연결 문제가 아니므로 제외한다.
 */
function isNetworkError(error: unknown) {
  if (error instanceof ApiError || error instanceof HTTPError || isTimeoutError(error)) return false;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;

  return error instanceof TypeError && FETCH_FAILURE_MESSAGE_PATTERN.test(error.message);
}

export { isNetworkError };
