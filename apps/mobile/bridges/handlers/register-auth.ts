import type { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS } from '@knockdog/bridge-core';
import { kakaoLogin, googleLogin, appleLogin, isNativeLoginCancelled } from '../../lib/auth';

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
      if (isNativeLoginCancelled(error)) {
        throw { code: 'SOCIAL_LOGIN_CANCELLED', message: 'Kakao login cancelled' };
      }
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
      if (isNativeLoginCancelled(error)) {
        throw { code: 'SOCIAL_LOGIN_CANCELLED', message: 'Google login cancelled' };
      }
      console.error('[Bridge] Google login error:', error);
      throw { code: 'AUTH_FAILED', message: 'Google login failed', error };
    }
  });

  // Apple 로그인
  router.register(METHODS.appleLogin, async () => {
    try {
      const result = await appleLogin();

      if (!result) {
        throw { code: 'AUTH_FAILED', message: 'Apple login failed' };
      }

      return result;
    } catch (error) {
      if (isNativeLoginCancelled(error)) {
        throw { code: 'SOCIAL_LOGIN_CANCELLED', message: 'Apple login cancelled' };
      }
      console.error('[Bridge] Apple login error:', error);
      throw { code: 'AUTH_FAILED', message: 'Apple login failed', error };
    }
  });
}

export { registerAuthHandlers };
