import type { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS } from '@knockdog/bridge-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isSocialLoginCancelled } from '../../../knockdog/src/features/auth/lib/socialLoginCancelledError';
import { registerAuthHandlers } from './register-auth';

const mocks = vi.hoisted(() => ({
  googleSignIn: vi.fn(),
  kakaoLogin: vi.fn(),
  appleSignIn: vi.fn(),
}));

vi.mock('@react-native-kakao/user', () => ({ login: mocks.kakaoLogin, me: vi.fn() }));
vi.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    hasPlayServices: vi.fn().mockResolvedValue(true),
    signOut: vi.fn().mockResolvedValue(undefined),
    signIn: mocks.googleSignIn,
  },
  statusCodes: { SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED' },
}));
vi.mock('expo-apple-authentication', () => ({
  signInAsync: mocks.appleSignIn,
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
}));

describe('native social login cancellation', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    [METHODS.googleLogin, () => mocks.googleSignIn.mockResolvedValueOnce({ type: 'cancelled', data: null })],
    [METHODS.kakaoLogin, () => mocks.kakaoLogin.mockRejectedValueOnce({ code: 'Cancelled' })],
    [METHODS.appleLogin, () => mocks.appleSignIn.mockRejectedValueOnce({ code: 'ERR_REQUEST_CANCELED' })],
  ])('preserves the cancellation signal for %s', async (method, mockCancel) => {
    mockCancel();
    const register = vi.fn<(method: string, handler: () => Promise<unknown>) => void>();
    registerAuthHandlers({ register } as unknown as NativeBridgeRouter);

    const handler = register.mock.calls.find(([registeredMethod]) => registeredMethod === method)?.[1];
    expect(handler).toBeTypeOf('function');
    const result = await handler?.().catch((error: unknown) => error);

    expect(result).toMatchObject({ code: 'SOCIAL_LOGIN_CANCELLED' });
    expect(isSocialLoginCancelled(result)).toBe(true);
    if (method === METHODS.kakaoLogin) expect(mocks.kakaoLogin).toHaveBeenCalledOnce();
  });
});
