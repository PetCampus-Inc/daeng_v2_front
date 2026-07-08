import { ApiError } from '@shared/api';
import { route } from '@shared/constants/route';
import { navigateToLogin } from '@shared/lib/bridge';

import { clearSession } from '@entities/owner-verification';

import {
  mapRoleConversionErrorToStatus,
  OWNER_VERIFICATION_MESSAGE_KEY,
  shouldClearOwnerVerificationSession,
} from '@views/role-conversion/complete/config/ownerVerificationError';

interface RoleConversionResultPushOptions {
  pathname: string;
  query?: Record<string, string>;
}

function navigateToRoleConversionResult(
  error: unknown,
  push: (options: RoleConversionResultPushOptions) => void
) {
  if (error instanceof ApiError && error.code === OWNER_VERIFICATION_MESSAGE_KEY.UNAUTHORIZED) {
    void navigateToLogin();
    return;
  }

  if (shouldClearOwnerVerificationSession(error)) {
    clearSession();
  }

  push({
    pathname: route.roleConversion.complete.root,
    query: {
      status: mapRoleConversionErrorToStatus(error),
    },
  });
}

export { navigateToRoleConversionResult };
