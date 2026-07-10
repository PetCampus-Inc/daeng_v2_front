import { useSearchParams } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { clearSession } from '@entities/owner-verification';
import { saveOwnerKindergartenFromVerification } from '@features/role-conversion';
import { route } from '@shared/constants/route';
import { EXTERNAL_LINKS } from '@shared/constants';
import { useOpenExternalLink, useStackNavigation } from '@shared/lib/bridge';

import { RESULT_STATUS } from '@views/role-conversion/complete/config/roleConversionResultStatus';
import { getResultContent } from '@views/role-conversion/complete/config/roleConversionResultContent';
import { resolveResultStatus } from '@views/role-conversion/complete/lib/resolveRoleConversionResultStatus';
import { navigateToRoleConversionResult } from '@views/role-conversion/complete/lib/navigateToRoleConversionResult';
import { submitOwnerVerification } from '@views/role-conversion/lib/submitOwnerVerification';

function useResultPage() {
  const searchParams = useSearchParams();
  const { push, replace, reset } = useStackNavigation();
  const openExternalLink = useOpenExternalLink();

  const status = resolveResultStatus(searchParams.get('status'));
  const content = getResultContent(status);

  const { mutate: retrySubmit, isPending: isRetryPending } = useMutation({
    mutationFn: submitOwnerVerification,
    onSuccess: (kindergarten) => {
      if (kindergarten) {
        saveOwnerKindergartenFromVerification(kindergarten);
      }

      clearSession();
      replace({
        pathname: route.roleConversion.complete.root,
        query: { status: RESULT_STATUS.SUCCESS },
      });
    },
    onError: (error) => {
      navigateToRoleConversionResult(error, replace);
    },
  });

  const handlePrimaryClick = () => {
    switch (status) {
      case RESULT_STATUS.DUPLICATE:
      case RESULT_STATUS.CLOSED_OR_SUSPENDED:
        openExternalLink(EXTERNAL_LINKS.OWNER_VERIFICATION_CONTACT);
        return;
      case RESULT_STATUS.TEMPORARY:
        if (isRetryPending) return;

        retrySubmit();
        return;
      default:
        return;
    }
  };

  const handleSecondaryClick = () => {
    if (isRetryPending) return;

    switch (status) {
      case RESULT_STATUS.SUCCESS:
      case RESULT_STATUS.TEMPORARY:
        reset(route.root);
        return;
      case RESULT_STATUS.DUPLICATE:
      case RESULT_STATUS.CLOSED_OR_SUSPENDED:
        push({ pathname: route.roleConversion.businessVerification.root });
        return;
      default:
        return;
    }
  };

  return {
    status,
    content,
    isRetryPending,
    // @todo 보호자 초대 플로우 연결 전까지 비활성화
    isPrimaryDisabled: status === RESULT_STATUS.SUCCESS || isRetryPending,
    handlePrimaryClick,
    handleSecondaryClick,
  };
}

export { useResultPage };
