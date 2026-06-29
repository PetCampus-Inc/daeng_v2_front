import { useSearchParams } from 'next/navigation';

import { route } from '@shared/constants/route';
import { EXTERNAL_LINKS } from '@shared/constants';
import { useOpenExternalLink, useStackNavigation } from '@shared/lib/bridge';

import { RESULT_STATUS } from '@views/role-conversion/complete/config/roleConversionResultStatus';
import { getResultContent } from '@views/role-conversion/complete/config/roleConversionResultContent';
import { resolveResultStatus } from '@views/role-conversion/complete/lib/resolveRoleConversionResultStatus';

function useResultPage() {
  const searchParams = useSearchParams();
  const { push, reset } = useStackNavigation();
  const openExternalLink = useOpenExternalLink();

  const status = resolveResultStatus(searchParams.get('status'));
  const content = getResultContent(status);

  const handlePrimaryClick = () => {
    switch (status) {
      case RESULT_STATUS.DUPLICATE:
      case RESULT_STATUS.CLOSED_OR_SUSPENDED:
        openExternalLink(EXTERNAL_LINKS.OWNER_VERIFICATION_CONTACT);
        return;
      case RESULT_STATUS.TEMPORARY:
        push({ pathname: route.roleConversion.privacyConsent.root });
        return;
      default:
        return;
    }
  };

  const handleSecondaryClick = () => {
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
    // @todo 보호자 초대 플로우 연결 전까지 비활성화
    isPrimaryDisabled: status === RESULT_STATUS.SUCCESS,
    handlePrimaryClick,
    handleSecondaryClick,
  };
}

export { useResultPage };
