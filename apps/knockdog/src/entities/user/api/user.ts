import { api } from '@shared/api';

/** `POST` - 회원 탈퇴 API */
const postWithdraw = async (userId: string) => {
  return await api.post(`auth/withdraw/${userId}`);
};

export { postWithdraw };
