import { beforeEach, describe, expect, it, vi } from 'vitest';
import { METHODS } from '@knockdog/bridge-core';
import { registerAnalyticsHandlers } from '../../bridges/handlers/register-analytics';

const mocks = vi.hoisted(() => ({
  setUser: vi.fn(),
  setUserId: vi.fn(),
}));
vi.mock('@sentry/react-native', () => ({ setUser: mocks.setUser }));
vi.mock('@react-native-firebase/app', () => ({ getApp: () => ({}) }));
vi.mock('@react-native-firebase/analytics', () => ({
  getAnalytics: () => ({}),
  logEvent: vi.fn(),
  setAnalyticsCollectionEnabled: vi.fn(),
  setUserId: mocks.setUserId,
}));

describe('네이티브 Sentry 사용자 동기화', () => {
  let syncUser: (params: { user_id: string | null; collection_enabled?: boolean }) => Promise<unknown>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.setUserId.mockResolvedValue(undefined);
    registerAnalyticsHandlers({
      register: (method: string, handler: typeof syncUser) => {
        if (method === METHODS.analyticsSetUserId) syncUser = handler;
      },
    } as unknown as Parameters<typeof registerAnalyticsHandlers>[0]);
  });

  it('로그인과 계정 변경 시 내부 ID만 설정하고 로그아웃 시 해제한다', async () => {
    await syncUser({ user_id: 'user-a' });
    await syncUser({ user_id: 'user-b' });
    await syncUser({ user_id: null });
    expect(mocks.setUser.mock.calls).toEqual([[{ id: 'user-a' }], [{ id: 'user-b' }], [null]]);
  });

  it('Firebase가 실패해도 Sentry의 이전 사용자 정보는 해제한다', async () => {
    mocks.setUserId.mockRejectedValueOnce(new Error('Firebase unavailable'));
    await expect(syncUser({ user_id: null })).rejects.toThrow('Firebase unavailable');
    expect(mocks.setUser).toHaveBeenCalledWith(null);
  });

  it('수집 제외 요청은 Firebase와 Sentry의 사용자 정보를 모두 해제한다', async () => {
    await syncUser({ user_id: 'user-a', collection_enabled: true });
    await syncUser({ user_id: 'user-b', collection_enabled: false });

    expect(mocks.setUserId).toHaveBeenLastCalledWith(expect.anything(), null);
    expect(mocks.setUser).toHaveBeenLastCalledWith(null);
  });
});
