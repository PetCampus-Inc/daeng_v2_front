import { postWithdraw, type WithdrawRequest } from '@entities/user';
import { tokenUtils } from '@shared/utils';
import { eventBus } from '@shared/utils';
import { clearPushDeviceRegistration } from '@features/push/model/pushDeviceStorage';

/**
 * 탈퇴 함수
 *
 * @description 탈퇴를 처리하는 함수입니다.
 *              서버에 탈퇴 요청을 보내고, 성공 시 로그아웃을 처리합니다.
 */
const withdraw = async (request: WithdrawRequest) => {
  // 백엔드가 사용자 탈퇴, 모든 세션, 모든 푸시 기기 등록을 하나의 트랜잭션으로 무효화한다.
  await postWithdraw(request);

  clearPushDeviceRegistration();
  tokenUtils.removeAccessToken();
  eventBus.publish('auth:logout');
};

export { withdraw };
