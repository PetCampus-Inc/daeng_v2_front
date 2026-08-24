import { postLogout } from '@shared/api';
import { eventBus, tokenUtils } from '@shared/utils';
import { useUserStore } from '@entities/user';
import { clearPushDeviceRegistration, loadPushDeviceRegistration } from '@features/push/model/pushDeviceStorage';
import {
  beginPushDeviceLogout,
  endPushDeviceLogout,
  waitForPendingPushDeviceRegistration,
} from '@features/push/model/pendingPushDeviceRegistration';

/**
 * 로그아웃 함수
 *
 * @description 로그아웃을 처리하는 함수입니다.
 *              서버에 로그아웃 요청을 보내 인증 토큰을 제거하고,
 *              로그인이 필요한 데이터 스토리지를 초기화합니다.
 */
interface LogoutOptions {
  /**
   * 이미 인증이 무효화된 경우 서버 로그아웃 요청을 생략합니다.
   * 401 인터셉터에서 다시 401이 발생하는 순환을 방지합니다.
   */
  notifyServer?: boolean;
}

const logout = async ({ notifyServer = true }: LogoutOptions = {}) => {
  beginPushDeviceLogout();

  try {
    // 등록 요청이 완료된 뒤 ID를 읽어야, 로그아웃 중 생성된 등록도 서버에서 함께 해제할 수 있다.
    await waitForPendingPushDeviceRegistration();

    const registration = loadPushDeviceRegistration();
    const currentUserId = useUserStore.getState().user?.userId;
    const pushDeviceId =
      registration && registration.userId === currentUserId ? registration.pushDeviceId : undefined;

    // 서버가 인증된 세션과 기기 등록의 소유 관계를 검증하고 함께 해제한다.
    // 다른 계정의 등록값은 절대 현재 세션의 로그아웃 body에 넣지 않는다.
    if (notifyServer) {
      await postLogout(pushDeviceId ? { pushDeviceId } : undefined);
    }

    // 네트워크 실패 시에는 다음 동일 계정 로그인에서 기기 등록을 재동기화할 수 있도록 보존한다.
    // 세션이 이미 무효화된 경우에는 다른 계정에 등록 정보가 이어지지 않도록 제거한다.
    clearPushDeviceRegistration();
  } finally {
    // 로그아웃 API가 실패해도 로그아웃 처리
    tokenUtils.removeAccessToken();
    eventBus.publish('auth:logout');
    endPushDeviceLogout();
  }
};

export { logout };
