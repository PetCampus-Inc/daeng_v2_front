import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { clearSession } from '@entities/owner-verification';
import { OWNER_ROLE_QUERY_KEY } from '@entities/user';
import { getQueryClient } from '@shared/api';
import { route } from '@shared/constants/route';
import { trackOwnerVerificationStatus } from '@shared/lib/analytics';
import { useStackNavigation } from '@shared/lib/bridge';

import { RESULT_STATUS } from '@views/role-conversion/complete/config/roleConversionResultStatus';
import { navigateToRoleConversionResult } from '@views/role-conversion/complete/lib/navigateToRoleConversionResult';
import { submitOwnerVerification } from '@views/role-conversion/lib/submitOwnerVerification';

function usePrivacyConsentPage() {
  const { push } = useStackNavigation();
  const [isAgreed, setIsAgreed] = useState(false);

  const { mutate: submitOwnerVerificationMutate, isPending } = useMutation({
    mutationFn: submitOwnerVerification,
    onSuccess: () => {
      trackOwnerVerificationStatus({ status: 'approved' });
      clearSession();
      // 원장 권한 확인 API 재조회 → 마이페이지가 즉시 원장 상태/유치원 정보로 전환
      getQueryClient().invalidateQueries({ queryKey: [OWNER_ROLE_QUERY_KEY] });
      push({
        pathname: route.roleConversion.complete.root,
        query: { status: RESULT_STATUS.SUCCESS },
      });
    },
    onError: (error) => {
      trackOwnerVerificationStatus({ status: 'failed' });
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
