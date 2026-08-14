import { postLogout } from '@shared/api';
import { eventBus, tokenUtils } from '@shared/utils';
import { deletePushDevice } from '@entities/user';
import { clearPushDeviceRegistration, loadPushDeviceRegistration } from '@features/push/model/pushDeviceStorage';

/**
 * 로그아웃 함수
 *
 * @description 로그아웃을 처리하는 함수입니다.
 *              서버에 로그아웃 요청을 보내 인증 토큰을 제거하고,
 *              로그인이 필요한 데이터 스토리지를 초기화합니다.
 */
const logout = async () => {
  try {
    const registration = loadPushDeviceRegistration();
    if (registration) {
      try {
        await deletePushDevice(registration.pushDeviceId);
      } catch (error) {
        // 서버 해제 실패가 로컬 로그아웃을 막아서는 안 된다.
        console.warn('[Push] device unregister failed', error);
      } finally {
        clearPushDeviceRegistration();
      }
    }
    await postLogout();
  } finally {
    // 로그아웃 API가 실패해도 로그아웃 처리
    tokenUtils.removeAccessToken();
    eventBus.publish('auth:logout');
  }
};

export { logout };
