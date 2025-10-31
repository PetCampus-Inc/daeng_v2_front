import { type SendEmailStatus, type SendEmailResultCode } from '../model/email';
import { api, ApiResponse } from '@shared/api';

export interface VerifyEmailParams {
  code: string;
  email: string;
}

/** `POST` - 이메일 인증하기 API */
const postVerifyEmail = async (params: VerifyEmailParams): Promise<ApiResponse> => {
  return await api.post('auth/email/verify', { json: params }).json<ApiResponse>();
};

export interface SendEmailParams {
  email: string;
  name: string;
}

/** `POST` - 인증 이메일 전송 API */
const postSendEmail = async (params: SendEmailParams) => {
  return api.post('auth/email/send', { json: params }).json<ApiResponse<SendEmailStatus, SendEmailResultCode>>();
};

/** `GET` - 이메일 인증 확인 API */
const fetchEmailVerification = async () => {
  return api.get('auth/email/verification').json<ApiResponse<boolean>>();
};

export { postVerifyEmail, postSendEmail, fetchEmailVerification };
