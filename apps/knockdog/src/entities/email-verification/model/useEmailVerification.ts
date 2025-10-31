import { useMutation } from '@tanstack/react-query';

import { useCallback, useState } from 'react';

import { type SendEmailStatus, type SendEmailResultCode } from './email';
import { SEND_EMAIL_RESULT_CODE } from '../constant/email';
import { postSendEmail, fetchEmailVerification } from '../api/verifyEmail';

import { ApiResponse } from '@shared/api';
import { parseArrayToDate, getTimeRemaining } from '@shared/utils';

interface UseEmailVerificationProps {
  duration?: number;
  onSendSuccess?: () => void;
  onVerificationSuccess?: () => void;
  onError?: (error: Error) => void;
}

/** 이메일 전송 및 인증 상태 확인 */
const useEmailVerification = ({ onSendSuccess, onVerificationSuccess, onError }: UseEmailVerificationProps = {}) => {
  const [error, setError] = useState<string | null>(null);

  const { mutate: sendEmail, isPending: isSending } = useMutation({
    mutationFn: postSendEmail,
    onSuccess: (response) => handleSendSuccess(response),
    onError,
  });

  const { mutate: emailVerification, isPending: isVerifying } = useMutation({
    mutationFn: fetchEmailVerification,
    onSuccess: (response) => handleVerificationSuccess(response),
    onError,
  });

  /** 인증 이메일 전송 */
  const send = useCallback((email: string, name: string) => sendEmail({ email, name }), [sendEmail]);

  /** 이메일 인증 확인 */
  const verification = useCallback(() => emailVerification(), [emailVerification]);

  /** 인증 이메일 전송 성공 */
  const handleSendSuccess = ({ code, data }: ApiResponse<SendEmailStatus, SendEmailResultCode>) => {
    // 최대 인증 시도 횟수 초과
    if (code === SEND_EMAIL_RESULT_CODE.MAX_VERIFICATION_ATTEMPTS) {
      const { attemptCount, maxAttempts, verificationExpiryDate } = data;

      const date = parseArrayToDate(verificationExpiryDate);
      const { min, sec } = getTimeRemaining(date);

      const message = `${min}분 ${sec}초 뒤, 다시 시도해 주세요 (재전송 가능 횟수 ${attemptCount}/${maxAttempts})`;
      setError(message);
    }

    // 이메일 전송 성공
    else if (code === SEND_EMAIL_RESULT_CODE.SUCCESS) {
      setError(null);
      onSendSuccess?.();
    }
  };

  /** 이메일 인증 확인 성공 */
  const handleVerificationSuccess = (response: ApiResponse<boolean>) => {
    if (response.data) onVerificationSuccess?.();
    else setError('이메일 인증 실패');
  };

  return { send, verification, isSending, isVerifying, error };
};

export { useEmailVerification };
