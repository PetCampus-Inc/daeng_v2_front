import { useState } from 'react';

import { saveBusinessRegistrationNumber } from '@entities/owner-verification';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

const BIZ_NO_LEN = 10;

function useBusinessVerificationPage() {
  const { push } = useStackNavigation();
  const [bizNo, setBizNo] = useState('');

  const handleInputChange = (value: string) => {
    setBizNo(value.replace(/\D/g, '').slice(0, BIZ_NO_LEN));
  };

  const handleClear = () => {
    setBizNo('');
  };

  const handleNextClick = () => {
    saveBusinessRegistrationNumber(bizNo);
    push({ pathname: route.roleConversion.privacyConsent.root });
  };

  return {
    bizNo,
    isNextEnabled: bizNo.length === BIZ_NO_LEN,
    handleInputChange,
    handleClear,
    handleNextClick,
  };
}

export { useBusinessVerificationPage };
