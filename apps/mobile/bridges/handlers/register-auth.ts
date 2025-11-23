import type { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS } from '@knockdog/bridge-core';
import { kakaoLogin, googleLogin } from '../../lib/auth';

function registerAuthHandlers(router: NativeBridgeRouter) {
  // Kakao 로그인
  router.register(METHODS.kakaoLogin, async () => {
    try {
      const result = await kakaoLogin();

      if (!result) {
        throw { code: 'AUTH_FAILED', message: 'Kakao login failed' };
      }

      return result;
    } catch (error) {
      console.error('[Bridge] Kakao login error:', error);
      throw { code: 'AUTH_FAILED', message: 'Kakao login failed', error };
    }
  });

  // Google 로그인
  router.register(METHODS.googleLogin, async () => {
    try {
      const result = await googleLogin();

      if (!result) {
        throw { code: 'AUTH_FAILED', message: 'Google login failed' };
      }

      return result;
    } catch (error) {
      console.error('[Bridge] Google login error:', error);
      throw { code: 'AUTH_FAILED', message: 'Google login failed', error };
    }
  });
}

export { registerAuthHandlers };
