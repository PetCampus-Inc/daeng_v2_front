import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { clearSession } from '@entities/owner-verification';
import { saveOwnerKindergartenFromVerification } from '@features/role-conversion';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

import { RESULT_STATUS } from '@views/role-conversion/complete/config/roleConversionResultStatus';
import { navigateToRoleConversionResult } from '@views/role-conversion/complete/lib/navigateToRoleConversionResult';
import { submitOwnerVerification } from '@views/role-conversion/lib/submitOwnerVerification';

function usePrivacyConsentPage() {
  const { push } = useStackNavigation();
  const [isAgreed, setIsAgreed] = useState(false);

  const { mutate: submitOwnerVerificationMutate, isPending } = useMutation({
    mutationFn: submitOwnerVerification,
    onSuccess: (kindergarten) => {
      if (kindergarten) {
        saveOwnerKindergartenFromVerification(kindergarten);
      }

      clearSession();
      push({
        pathname: route.roleConversion.complete.root,
        query: { status: RESULT_STATUS.SUCCESS },
      });
    },
    onError: (error) => {
      navigateToRoleConversionResult(error, push);
    },
  });

  const handleSubmit = () => {
    if (isPending) return;

    submitOwnerVerificationMutate();
  };

  return {
    isAgreed,
    isSubmitEnabled: isAgreed && !isPending,
    isSubmitPending: isPending,
    handleAgreedChange: setIsAgreed,
    handleSubmit,
  };
}

export { usePrivacyConsentPage };
