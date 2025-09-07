import { postLogout } from '@shared/api';
import { tokenUtils } from '@shared/utils';

/**
 * 로그아웃 함수
 *
 * @description 로그아웃을 처리하는 함수입니다.
 *              서버에 로그아웃 요청을 보내 인증 토큰을 제거하고,
 *              로그인이 필요한 데이터 스토리지를 초기화합니다.
 */
const logout = async () => {
  try {
    await postLogout();
  } finally {
    // 로그아웃 API가 실패해도 로그아웃 처리
    tokenUtils.removeAccessToken();
  }
};

export { logout };
