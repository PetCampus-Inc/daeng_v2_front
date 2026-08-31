import { HTTPError, TimeoutError, type NormalizedOptions } from 'ky';

import { retryWithTokenRefresh } from './retryWithTokenRefresh';

import { ApiError } from '../model/error';
import { REQUEST_FAILED_MESSAGE } from '../config/messages';
import { TOKEN_ERROR_CODE } from '../model/constant/authErrorCode';

import { tokenUtils } from '@shared/utils';
import { navigateToLogin } from '@shared/lib/bridge';

// '@shared/lib/auth'는 entities/user(유저 스토어·API)까지 정적으로 물고 있어, kyClient가
// 이 인터셉터를 구성에 쓰는 순환과 맞물리면 번들러/엔진(JSC 등)에 따라 순환 참조 중
// 모듈이 아직 초기화되지 않은 시점에 걸려 "Cannot access uninitialized variable" 오류가
// 날 수 있다. 실제로 로그아웃이 필요한 시점(401 처리)에만 동적으로 불러온다.
const getLogout = () => import('@shared/lib/auth').then((mod) => mod.logout);

const AUTH_PATH_PATTERN = /\/auth(?:\/|$)/;
const LOGOUT_PATH_PATTERN = /\/auth\/logout$/;

/**
 * `beforeRequest` - `Authorization` 헤더에 액세스 토큰 삽입 인터셉터
 *
 * @description API 요청에 `Authorization` 헤더를 추가하는 인터셉터입니다.
 */
const insertAuthHeaderInterceptor = (request: Request) => {
  if (!isSameOrigin(request)) return;

  const pathname = new URL(request.url).pathname;
  const isAuthPath = AUTH_PATH_PATTERN.test(pathname);
  const requiresAuthorization = !isAuthPath || LOGOUT_PATH_PATTERN.test(pathname);

  if (requiresAuthorization) {
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
 * 이전 세션의 늦은 401 응답이 새 세션을 로그아웃시키지 않도록 확인한다.
 * 인증 헤더 없이 보낸 요청(로그인·토큰 재발급 등)의 실패도 현재 세션을 무효화하지 않는다.
 */
const isStaleOrUnauthenticatedRequest = (request: Request) => {
  const authorization = request.headers.get('authorization');
  if (!authorization) return true;

  const requestToken = tokenUtils.removeBearerPrefix(authorization);
  return !requestToken || requestToken !== tokenUtils.getAccessToken();
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

  // 로그아웃 후 남아 있던 탭 WebView의 요청, 또는 새 로그인 전의 요청은
  // 현재 세션과 토큰이 다르다. 이 응답으로 새 세션을 정리하면 안 된다.
  if (isStaleOrUnauthenticatedRequest(request)) return response;

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
      case TOKEN_ERROR_CODE.UNAUTHORIZED_REQUEST:
      case TOKEN_ERROR_CODE.TOKEN_VERIFICATION_FAILED:
        // 이미 인증이 무효화된 응답이므로 서버 로그아웃을 재호출하지 않는다.
        // 이 요청까지 401이 되면 인터셉터가 재진입할 수 있다.
        await (await getLogout())({ notifyServer: false });
        await navigateToLogin();
        break;
    }
  } catch (refreshError) {
    console.error('액세스 토큰 갱신 중 오류 발생:', refreshError);

    // 토큰 갱신 중 오류 발생 시, 로그아웃 처리
    await (await getLogout())({ notifyServer: false });
    await navigateToLogin();
  }

  return response;
};

/**
 * `beforeError` - 에러 응답 데이터 변환 인터셉터
 *
 * @description API 에러 응답 데이터를 `ApiError` 객체로 변환하여 반환하는 인터셉터입니다.
 */
const transformErrorInterceptor = async (error: HTTPError | TimeoutError) => {
  if (error instanceof TimeoutError) {
    throw new ApiError(408, 'TIMEOUT', REQUEST_FAILED_MESSAGE);
  }

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
