import { api, ApiResponse } from '@shared/api';

interface VerifyEmailParams {
  code: string;
  email: string;
}

/** `POST` - 이메일 인증 API */
const postVerifyEmail = async (params: VerifyEmailParams): Promise<ApiResponse> => {
  return await api.post('auth/email/verify', { json: params }).json<ApiResponse>();
};

export { postVerifyEmail };
