import { route } from '@shared/constants/route';

import { clearSession } from '@entities/owner-verification';

import {
  mapRoleConversionErrorToStatus,
  shouldClearOwnerVerificationSession,
} from '@views/role-conversion/complete/config/ownerVerificationError';
import { handleOwnerVerificationAuthError } from '@views/role-conversion/complete/lib/handleOwnerVerificationAuthError';

interface RoleConversionResultPushOptions {
  pathname: string;
  query?: Record<string, string>;
}

function navigateToRoleConversionResult(
  error: unknown,
  push: (options: RoleConversionResultPushOptions) => void
) {
  if (handleOwnerVerificationAuthError(error)) {
    return;
  }

  if (shouldClearOwnerVerificationSession(error)) {
    clearSession();
    push({ pathname: route.roleConversion.kindergartenSearch.root });
    return;
  }

  push({
    pathname: route.roleConversion.complete.root,
    query: {
      status: mapRoleConversionErrorToStatus(error),
    },
  });
}

export { navigateToRoleConversionResult };
