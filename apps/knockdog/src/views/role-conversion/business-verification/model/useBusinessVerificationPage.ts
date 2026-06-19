import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';

const BIZ_NO_LEN = 10;

function useBusinessVerificationPage() {
  const [bizNo, setBizNo] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const { mutate: verifyBizNo, isPending } = useMutation({
    // @todo BE API 연동
    mutationFn: async (_bizNo: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onSuccess: () => setIsVerified(true),
  });

  const handleInputChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, BIZ_NO_LEN);
    setBizNo(digits);
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
    isVerifyEnabled,
    isNextEnabled: isVerified,
    handleInputChange,
    handleVerifyClick,
    handleNextClick,
  };
}

export { useBusinessVerificationPage };
