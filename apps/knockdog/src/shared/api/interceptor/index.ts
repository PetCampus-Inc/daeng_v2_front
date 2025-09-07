import { HTTPError, type NormalizedOptions } from 'ky';

import { retryWithTokenRefresh } from './retryWithTokenRefresh';

import { ApiError } from '../model/error';
import { TOKEN_ERROR_CODE } from '../model/constant/authErrorCode';

import { tokenUtils } from '@shared/utils';
import { logout } from '@shared/lib/auth';

const EXCLUDE_PATHS = ['/auth'];

/**
 * `beforeRequest` - `Authorization` 헤더에 액세스 토큰 삽입 인터셉터
 *
 * @description API 요청에 `Authorization` 헤더를 추가하는 인터셉터입니다.
 */
const insertAuthHeaderInterceptor = (request: Request) => {
  if (!EXCLUDE_PATHS.some((excludePath) => request.url.includes(excludePath))) {
    // 제외 경로가 아니라면 Authorization 헤더 추가
    const token = tokenUtils.getAccessToken();

    if (token) request.headers.set('Authorization', `Bearer ${token}`);
  }
};

/**
 * `afterResponse` - 액세스 토큰 업데이트 인터셉터
 *
 * @description API 응답 헤더에서 액세스 토큰을 추출하여 로컬 스토리지에 저장하는 인터셉터입니다.
 */
const updateAccessTokenInterceptor = (_request: Request, _options: NormalizedOptions, response: Response): Response => {
  const authHeader = response.headers.get('authorization');

  if (authHeader) {
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
 * `beforeError` - 액세스 토큰 리프레시 인터셉터
 *
 * @description 액세스 토큰 만료 시, 토큰을 갱신한 뒤 API 요청을 재시도하는 인터셉터입니다.
 */
const tokenRefreshInterceptor = async (error: HTTPError): Promise<HTTPError> => {
  try {
    const { code } = (await error.response.json()) as ApiError;

    switch (code) {
      // 액세스 토큰 만료 시, 토큰 갱신
      case TOKEN_ERROR_CODE.EXPIRED_TOKEN:
        tokenUtils.removeAccessToken();
        await retryWithTokenRefresh(error.request);
        break;

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

  return error;
};

/**
 * `beforeError` - 에러 응답 데이터 변환 인터셉터
 *
 * @description API 에러 응답 데이터를 `ApiError` 객체로 변환하여 반환하는 인터셉터입니다.
 */
const transformErrorInterceptor = async (error: HTTPError) => {
  try {
    const { status, code, message } = (await error.response.json()) as ApiError;
    return new ApiError(status, code, message);
  } catch {
    return error;
  }
};

export {
  insertAuthHeaderInterceptor,
  updateAccessTokenInterceptor,
  tokenRefreshInterceptor,
  transformErrorInterceptor,
};
