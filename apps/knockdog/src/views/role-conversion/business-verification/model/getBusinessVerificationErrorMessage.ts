import { ApiError } from '@shared/api';

import {
  BUSINESS_VERIFICATION_ERROR_CODE,
  businessVerificationError,
} from '../config/businessVerificationError';

function getBusinessVerificationErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case BUSINESS_VERIFICATION_ERROR_CODE.DUPLICATE:
        return businessVerificationError.duplicate;
      case BUSINESS_VERIFICATION_ERROR_CODE.INVALID_FORMAT:
        return businessVerificationError.invalidFormat;
      case BUSINESS_VERIFICATION_ERROR_CODE.CLOSED_OR_SUSPENDED:
        return businessVerificationError.closedOrSuspended;
      default:
        return businessVerificationError.temporary;
    }
  }

  return businessVerificationError.temporary;
}

export { getBusinessVerificationErrorMessage };
