import { HTTPError, type NormalizedOptions } from 'ky';

import { retryWithTokenRefresh } from './retryWithTokenRefresh';

import { ApiError } from '../model/error';
import { TOKEN_ERROR_CODE } from '../model/constant/authErrorCode';

import { tokenUtils } from '@shared/utils';
import { logout } from '@shared/lib/auth';

// 제외 경로 패턴 (/^\/auth(?:\/|$)/ = /auth 또는 /auth/ 로 시작하는 경로)
const EXCLUDE_PATHS = [/^\/auth(?:\/|$)/];

/**
 * `beforeRequest` - `Authorization` 헤더에 액세스 토큰 삽입 인터셉터
 *
 * @description API 요청에 `Authorization` 헤더를 추가하는 인터셉터입니다.
 */
const insertAuthHeaderInterceptor = (request: Request) => {
  if (!isSameOrigin(request)) return;

  if (!EXCLUDE_PATHS.some((excludePath) => excludePath.test(request.url))) {
    // 제외 경로가 아니라면 Authorization 헤더 추가
    const token = tokenUtils.getAccessToken();

    if (token) request.headers.set('Authorization', `Bearer ${token}`);
  }
};

/**
 * 요청 URL이 동일한 `Origin`인지 확인하는 함수
 *
 * @param request - 요청 객체
 * @returns 동일 출처 여부
 */
const isSameOrigin = (request: Request) => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  return !!(apiBaseUrl && request.url.includes(apiBaseUrl));
};

/**
 * `afterResponse` - 액세스 토큰 업데이트 인터셉터
 *
 * @description API 응답 헤더에서 액세스 토큰을 추출하여 로컬 스토리지에 저장하는 인터셉터입니다.
 */
const updateAccessTokenInterceptor = (request: Request, _options: NormalizedOptions, response: Response): Response => {
  if (!isSameOrigin(request)) return response;

  const authHeader = response.headers.get('authorization');

  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    const existingToken = tokenUtils.getAccessToken();
    const newToken = tokenUtils.removeBearerPrefix(authHeader);

    // 기존 토큰과 새 토큰이 다르면 새 토큰으로 업데이트
    if (existingToken !== newToken) {
      tokenUtils.setAccessToken(newToken);
    }
  }

  return response;
};

/**
 * `afterResponse` - 액세스 토큰 리프레시 인터셉터
 *
 * @description 액세스 토큰 만료 시, 토큰을 갱신한 뒤 API 요청을 재시도하는 인터셉터입니다.
 */
const tokenRefreshInterceptor = async (
  request: Request,
  _options: NormalizedOptions,
  response: Response
): Promise<Response> => {
  // 401 에러가 아니라면 그대로 반환
  if (response.status !== 401) return response;

  try {
    const { code } = (await response.clone().json()) as ApiError;

    switch (code) {
      // 액세스 토큰 만료 시, 토큰 갱신 후 재요청
      case TOKEN_ERROR_CODE.EXPIRED_TOKEN:
        tokenUtils.removeAccessToken();
        return await retryWithTokenRefresh(request);

      // 리프레시 토큰 만료, 유효하지 않은 토큰, 토큰 검증 실패 시 로그아웃 처리
      case TOKEN_ERROR_CODE.EXPIRED_REFRESH_TOKEN:
      case TOKEN_ERROR_CODE.INVALID_TOKEN:
      case TOKEN_ERROR_CODE.TOKEN_VERIFICATION_FAILED:
        logout();
        break;
    }
  } catch (refreshError) {
    console.error('액세스 토큰 갱신 중 오류 발생:', refreshError);

    // 토큰 갱신 중 오류 발생 시, 로그아웃 처리
    logout();
  }

  return response;
};

/**
 * `beforeError` - 에러 응답 데이터 변환 인터셉터
 *
 * @description API 에러 응답 데이터를 `ApiError` 객체로 변환하여 반환하는 인터셉터입니다.
 */
const transformErrorInterceptor = async (error: HTTPError) => {
  const { status } = error.response;

  const response = await error.response.clone().json();
  if (response.code !== undefined && response.message !== undefined) {
    throw new ApiError(status, response.code, response.message);
  }

  throw new ApiError(status, 'UNKNOWN_ERROR', '알 수 없는 오류가 발생했습니다.');
};

export {
  insertAuthHeaderInterceptor,
  updateAccessTokenInterceptor,
  tokenRefreshInterceptor,
  transformErrorInterceptor,
};
