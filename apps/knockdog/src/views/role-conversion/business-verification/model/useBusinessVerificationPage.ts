import { useState } from 'react';

import { saveBusinessRegistrationNumber } from '@entities/owner-verification';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';

const BIZ_NO_LEN = 10;

function useBusinessVerificationPage() {
  const { push, replace } = useStackNavigation();
  const [bizNo, setBizNo] = useState('');

  const handleInputChange = (value: string) => {
    setBizNo(value.replace(/\D/g, '').slice(0, BIZ_NO_LEN));
  };

  const handleClear = () => {
    setBizNo('');
  };

  const handleNextClick = () => {
    const saved = saveBusinessRegistrationNumber(bizNo);
    if (!saved) {
      toast({
        title: '진행 정보가 저장되지 않았습니다. 처음부터 다시 시작해 주세요.',
        shape: 'square',
        position: 'top',
      });
      replace({ pathname: route.roleConversion.kindergartenSearch.root });
      return;
    }

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
