import { postWithdraw, type WithdrawRequest } from '@entities/user';
import { tokenUtils } from '@shared/utils';
import { eventBus } from '@shared/utils';

/**
 * 탈퇴 함수
 *
 * @description 탈퇴를 처리하는 함수입니다.
 *              서버에 탈퇴 요청을 보내고, 성공 시 로그아웃을 처리합니다.
 */
const withdraw = async (request: WithdrawRequest) => {
  try {
    await postWithdraw(request);
  } finally {
    // 탈퇴 API가 실패해도 로그아웃 처리
    // tokenUtils.removeAccessToken();
    // eventBus.publish('auth:logout');
  }
};

export { withdraw };
