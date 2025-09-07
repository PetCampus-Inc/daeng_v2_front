import ky from 'ky';

import { postTokenReissue } from '../endpoint/auth';
import { tokenUtils } from '@shared/utils';

let isTokenRefreshing = false;

/** 요청 대기열 (액세스 토큰 갱신 완료 시 호출될 콜백 함수 목록) */
let subscribers: ((token: string) => void)[] = [];

/** 토큰 갱신 처리 함수 */
const retryWithTokenRefresh = async (request: Request): Promise<Response> => {
  // 토큰 갱신 중이라면 Request를 대기열에 추가
  if (isTokenRefreshing) return enqueueRequest(request);

  isTokenRefreshing = true;

  try {
    // 1. 액세스 토큰 갱신
    const newAccessToken = await refreshAccessToken();

    // 2. 대기열에 추가된 요청들을 새 토큰으로 재요청
    subscribers.forEach((cb) => cb(newAccessToken));
    subscribers = [];

    // 3. 새 토큰으로 요청 재시도
    const authRequest = createAuthRequest(request, newAccessToken);

    return ky(authRequest);
  } finally {
    isTokenRefreshing = false;
  }
};

/**
 * 액세스 토큰 갱신 함수
 *
 * @description 액세스 토큰을 갱신하고, 갱신된 액세스 토큰을 로컬 스토리지에 저장하는 함수입니다.
 */
const refreshAccessToken = async (): Promise<string> => {
  // 1. 액세스 토큰 갱신
  const response = await postTokenReissue();

  // 2. 헤더에서 액세스 토큰 추출
  const authorizationHeader = response.headers.get('authorization');

  // 3. 로컬 스토리지에 저장 후 반환
  if (authorizationHeader) {
    const newAccessToken = tokenUtils.removeBearerPrefix(authorizationHeader);
    tokenUtils.setAccessToken(newAccessToken);

    return newAccessToken;
  }

  throw new Error('Authorization 헤더에서 새로운 액세스 토큰을 찾을 수 없습니다.');
};

/** 대기열 추가 함수 */
const addSubscriber = (cb: (token: string) => void) => subscribers.push(cb);

/**
 * 요청을 토큰 갱신 대기열에 추가하는 함수
 *
 * @description 다른 요청이 액세스 토큰을 갱신 중일 때 사용되며,
 *              현재 요청을 토큰 갱신 완료 시 일괄 처리할 대기열에 추가하는 함수입니다.
 */
const enqueueRequest = async (request: Request): Promise<Response> => {
  return new Promise((resolve) => {
    addSubscriber((newToken: string) => {
      const authRequest = createAuthRequest(request, newToken);
      resolve(ky(authRequest));
    });
  });
};

/**
 * 요청 헤더에 액세스 토큰 추가하는 함수
 *
 * @description 요청 `Authorization` 헤더에 액세스 토큰 추가하는 함수입니다.
 */
const createAuthRequest = (request: Request, accessToken: string) => {
  const headers = new Headers(request.headers);

  headers.delete('Authorization');
  headers.set('Authorization', `Bearer ${accessToken}`);

  return new Request(request, { headers });
};

export { retryWithTokenRefresh };
