import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../model/error';
import { TOKEN_ERROR_CODE } from '../model/constant/authErrorCode';
import { tokenRefreshInterceptor } from './index';

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
