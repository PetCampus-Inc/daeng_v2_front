import { postBusinessRegistrationVerify } from '@entities/business-registration';
import { loadSession, postOwnerVerificationSubmit } from '@entities/owner-verification';
import { ApiError } from '@shared/api';

import { OWNER_VERIFICATION_CLIENT_ERROR } from '@views/role-conversion/complete/config/ownerVerificationError';

async function submitOwnerVerification() {
  const session = loadSession();

  if (!session?.ownerVerificationId || !session.businessRegistrationNumber) {
    throw new ApiError(
      400,
      OWNER_VERIFICATION_CLIENT_ERROR.SESSION_MISSING,
      '원장 인증 정보가 없습니다.'
    );
  }

  const { ownerVerificationId, businessRegistrationNumber, kindergarten } = session;

  await postBusinessRegistrationVerify({ registrationNumber: businessRegistrationNumber });

  await postOwnerVerificationSubmit({
    ownerVerificationId,
    businessRegistrationNumber,
    privacyConsentAgreed: true,
  });

  return kindergarten ?? null;
}

export { submitOwnerVerification };
