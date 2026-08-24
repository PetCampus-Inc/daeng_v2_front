import { useSearchParams } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';
import { METHODS } from '@knockdog/bridge-core';

import { clearSession } from '@entities/owner-verification';
import { OWNER_ROLE_QUERY_KEY } from '@entities/user';
import { getQueryClient } from '@shared/api';
import { route } from '@shared/constants/route';
import { EXTERNAL_LINKS } from '@shared/constants';
import { useBridge, useOpenExternalLink, useStackNavigation } from '@shared/lib/bridge';
import { isNativeWebView } from '@shared/lib/device';

import { RESULT_STATUS } from '@views/role-conversion/complete/config/roleConversionResultStatus';
import { getResultContent } from '@views/role-conversion/complete/config/roleConversionResultContent';
import { resolveResultStatus } from '@views/role-conversion/complete/lib/resolveRoleConversionResultStatus';
import { navigateToRoleConversionResult } from '@views/role-conversion/complete/lib/navigateToRoleConversionResult';
import { submitOwnerVerification } from '@views/role-conversion/lib/submitOwnerVerification';

function useResultPage() {
  const searchParams = useSearchParams();
  const { push, replace, reset } = useStackNavigation();
  const bridge = useBridge();
  const openExternalLink = useOpenExternalLink();

  const status = resolveResultStatus(searchParams.get('status'));
  const content = getResultContent(status);

  const { mutate: retrySubmit, isPending: isRetryPending } = useMutation({
    mutationFn: submitOwnerVerification,
    onSuccess: () => {
      clearSession();
      // 원장 권한 확인 API 재조회 → 마이페이지가 즉시 원장 상태/유치원 정보로 전환
      getQueryClient().invalidateQueries({ queryKey: [OWNER_ROLE_QUERY_KEY] });
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
      case RESULT_STATUS.SUCCESS: {
        // 완료 화면은 Stack WebView라 공통 탭 동기화가 실행되지 않는다.
        // reset 전에 네이티브 모드를 owner로 맞춰야 /owner/members의 부모 탭도 원장 탭으로 구성된다.
        void getQueryClient()
          .refetchQueries({ queryKey: [OWNER_ROLE_QUERY_KEY] })
          .then(async () => {
            if (!isNativeWebView()) return;
            await bridge.request(METHODS.navSetMainTabMode, {
              mode: 'owner',
              requestId: Date.now(),
              force: true,
            });
          })
          .catch((error) => {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[RoleConversion] failed to switch native tab mode', error);
            }
          })
          .finally(() => {
            reset(route.owner.members.root);
          });
        return;
      }
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
    isPrimaryDisabled: isRetryPending,
    handlePrimaryClick,
    handleSecondaryClick,
  };
}

export { useResultPage };
