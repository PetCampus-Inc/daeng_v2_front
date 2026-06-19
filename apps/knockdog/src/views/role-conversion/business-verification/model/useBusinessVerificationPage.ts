import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { getBusinessVerificationErrorMessage } from './getBusinessVerificationErrorMessage';

const BIZ_NO_LEN = 10;

function useBusinessVerificationPage() {
  const [bizNo, setBizNo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const { mutate: verifyBizNo, isPending } = useMutation({
    // @todo BE API 연동
    mutationFn: async (_bizNo: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      setError(null);
      setIsVerified(true);
    },
    onError: (err) => {
      setIsVerified(false);
      setError(getBusinessVerificationErrorMessage(err));
    },
  });

  const handleInputChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, BIZ_NO_LEN);
    setBizNo(digits);
    setError(null);
    setIsVerified(false);
  };

  const handleVerifyClick = () => {
    verifyBizNo(bizNo);
  };

  const handleNextClick = () => {
    // @todo 다음 단계 라우팅
  };

  const isVerifyEnabled = bizNo.length === BIZ_NO_LEN && !isVerified && !isPending;

  return {
    bizNo,
    error,
    isVerified,
    isVerifyEnabled,
    isNextEnabled: isVerified,
    handleInputChange,
    handleVerifyClick,
    handleNextClick,
  };
}

export { useBusinessVerificationPage };
