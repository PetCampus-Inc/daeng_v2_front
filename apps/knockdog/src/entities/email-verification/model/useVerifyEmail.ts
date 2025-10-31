'use client';

import { useEffect, useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'next/navigation';

import { postVerifyEmail } from '../api/verifyEmail';
import { type VerificationStatus } from './email';
import { VERIFICATION_STATUS } from '../constant/email';

/** 이메일 인증 Hook */
export const useVerifyEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(VERIFICATION_STATUS.PENDING);

  const params = useParams<{ code: string }>();
  const code = params?.code;

  const searchParams = useSearchParams();
  const email = searchParams?.get('email');

  const { mutate } = useMutation({
    mutationFn: postVerifyEmail,
    onSuccess: (response) => {
      if (response.code === 'SUCCESS') setVerificationStatus(VERIFICATION_STATUS.SUCCESS);
      else setVerificationStatus(VERIFICATION_STATUS.FAILED);
    },
    onError: () => setVerificationStatus(VERIFICATION_STATUS.FAILED),
  });

  useEffect(() => {
    if (!code || !email) {
      alert('잘못된 접근입니다.');
      window.close();
      return;
    }

    mutate({ code, email });
  }, [code, email, mutate]);

  return { verificationStatus };
};
