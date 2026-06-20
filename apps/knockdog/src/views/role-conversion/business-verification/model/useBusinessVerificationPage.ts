import { useState, type ReactNode } from 'react';

import { useMutation } from '@tanstack/react-query';

import { ApiError } from '@shared/api';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

import { devStubErrorByBizNo } from '../config/businessVerificationDevStub';
import { getBusinessVerificationErrorMessage } from './getBusinessVerificationErrorMessage';

const BIZ_NO_LEN = 10;

function useBusinessVerificationPage() {
  const { push } = useStackNavigation();
  const [bizNo, setBizNo] = useState('');
  const [error, setError] = useState<ReactNode | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const { mutate: verifyBizNo, isPending } = useMutation({
    // @todo BE API 연동 시 stub 제거 (26.06.19 작성)
    // stub는 로컬 테스트 시 발생하는 에러 처리 확인을 위해 작성됨
    mutationFn: async (bizNoValue: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const stubErrorCode = devStubErrorByBizNo[bizNoValue as keyof typeof devStubErrorByBizNo];

      if (stubErrorCode) {
        throw new ApiError(400, stubErrorCode, '');
      }
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
    push({ pathname: route.roleConversion.kindergartenSearch.root });
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
