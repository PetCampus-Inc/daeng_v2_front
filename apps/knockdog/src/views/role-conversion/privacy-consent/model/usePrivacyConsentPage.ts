import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { postBusinessRegistrationVerify } from '@entities/business-registration';
import { clearSession, loadSession, postOwnerVerificationSubmit } from '@entities/owner-verification';
import { ApiError } from '@shared/api';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

import { RESULT_STATUS } from '@views/role-conversion/complete/config/roleConversionResultStatus';
import { navigateToRoleConversionResult } from '@views/role-conversion/complete/lib/navigateToRoleConversionResult';

function usePrivacyConsentPage() {
  const { push } = useStackNavigation();
  const [isAgreed, setIsAgreed] = useState(false);

  const { mutate: submitOwnerVerification, isPending } = useMutation({
    mutationFn: async () => {
      const session = loadSession();

      if (!session?.ownerVerificationId || !session.businessRegistrationNumber) {
        throw new ApiError(400, 'UNKNOWN_ERROR', '원장 인증 정보가 없습니다.');
      }

      const { ownerVerificationId, businessRegistrationNumber } = session;

      await postBusinessRegistrationVerify({ registrationNumber: businessRegistrationNumber });

      return postOwnerVerificationSubmit({
        ownerVerificationId,
        businessRegistrationNumber,
        privacyConsentAgreed: true,
      });
    },
    onSuccess: () => {
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

    submitOwnerVerification();
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
