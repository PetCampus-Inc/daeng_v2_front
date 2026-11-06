import { ApiError } from '@shared/api';
import { navigateToLogin } from '@shared/lib/bridge';

import { OWNER_VERIFICATION_MESSAGE_KEY } from '@views/role-conversion/complete/config/ownerVerificationError';

/** 인증 만료 등 로그인 복구가 필요하면 true. 호출부에서 toast 등 일반 에러 처리를 스킵*/
function handleOwnerVerificationAuthError(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.code !== OWNER_VERIFICATION_MESSAGE_KEY.UNAUTHORIZED) {
    return false;
  }

  void navigateToLogin();
  return true;
}

export { handleOwnerVerificationAuthError };
