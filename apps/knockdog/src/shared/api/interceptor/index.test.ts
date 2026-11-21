import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HTTPError } from 'ky';
import * as Sentry from '@sentry/nextjs';

import { ApiError } from '../model/error';
import { TOKEN_ERROR_CODE } from '../model/constant/authErrorCode';
import { tokenRefreshInterceptor, transformErrorInterceptor } from './index';
import { reportCriticalFailure } from '@shared/lib/sentry/reportUnexpectedApiError';

const { getAccessToken, removeAccessToken, setAccessToken, logout, navigateToLogin, retryWithTokenRefresh } = vi.hoisted(() => ({
  getAccessToken: vi.fn<() => string | null>(),
  removeAccessToken: vi.fn(),
  setAccessToken: vi.fn(),
  logout: vi.fn(),
  navigateToLogin: vi.fn(),
  retryWithTokenRefresh: vi.fn(),
}));

vi.mock('@shared/utils', () => ({
  tokenUtils: {
    getAccessToken,
    removeAccessToken,
    setAccessToken,
    removeBearerPrefix: (token: string) => token.replace(/^Bearer\s+/i, ''),
  },
}));

vi.mock('@shared/lib/auth', () => ({ logout }));
vi.mock('@shared/lib/bridge', () => ({ navigateToLogin }));
vi.mock('./retryWithTokenRefresh', () => ({ retryWithTokenRefresh }));
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

const API_BASE_URL = 'https://api.knockdog.net';
const ACCESS_TOKEN = 'expired-access-token';

function expiredTokenRequest() {
  return new Request(`${API_BASE_URL}/api/v0/users/me`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });
}

function unauthorizedResponse(code: string) {
  return new Response(JSON.stringify({ code }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('API and critical failure reporting', () => {
  beforeEach(() => vi.mocked(Sentry.captureException).mockClear());

  it('reports a non-JSON 503 once with login context', async () => {
    const request = new Request(`${API_BASE_URL}/api/v0/auth/login`);
    const response = new Response('<h1>Service unavailable</h1>', { status: 503 });
    const error = new HTTPError(response, request, {} as never);

    await transformErrorInterceptor(error).catch((failure: unknown) => {
      expect(failure).toMatchObject({ status: 503, code: 'UNKNOWN_ERROR' });
      reportCriticalFailure('login', 'session', failure);
    });

    expect(Sentry.captureException).toHaveBeenCalledExactlyOnceWith(expect.any(ApiError), {
      tags: { feature: 'login', stage: 'session', source: 'api', http_status: '503' },
    });
  });

  it('reports a final 429 but ignores an input validation failure', () => {
    reportCriticalFailure('album_upload', 'upload', new ApiError(422, 'VALIDATION_FAILED', 'invalid'));
    reportCriticalFailure('album_upload', 'upload', new ApiError(429, 'RATE_LIMITED', 'rate limited'));

    expect(Sentry.captureException).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
      tags: { feature: 'album_upload', stage: 'upload', source: 'critical_flow', http_status: '429' },
    });
  });
});

describe('tokenRefreshInterceptor', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', API_BASE_URL);
    getAccessToken.mockReturnValue(ACCESS_TOKEN);
    removeAccessToken.mockReset();
    setAccessToken.mockReset();
    logout.mockReset().mockResolvedValue(undefined);
    navigateToLogin.mockReset().mockResolvedValue(undefined);
    retryWithTokenRefresh.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('refresh의 일시 실패에서는 기존 세션을 지우지 않는다', async () => {
    const response = unauthorizedResponse(TOKEN_ERROR_CODE.EXPIRED_TOKEN);
    retryWithTokenRefresh.mockRejectedValueOnce(new Error('Network request failed'));

    const result = await tokenRefreshInterceptor(expiredTokenRequest(), {} as never, response);

    expect(result).toBe(response);
    expect(removeAccessToken).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
    expect(navigateToLogin).not.toHaveBeenCalled();
  });

  it('refresh가 리프레시 토큰 만료를 반환한 경우에만 로그아웃한다', async () => {
    const response = unauthorizedResponse(TOKEN_ERROR_CODE.EXPIRED_TOKEN);
    retryWithTokenRefresh.mockRejectedValueOnce(
      new ApiError(401, TOKEN_ERROR_CODE.EXPIRED_REFRESH_TOKEN, '리프레시 토큰이 만료되었습니다.')
    );

    await tokenRefreshInterceptor(expiredTokenRequest(), {} as never, response);

    expect(logout).toHaveBeenCalledWith({ notifyServer: false });
    expect(navigateToLogin).toHaveBeenCalledOnce();
  });
});
