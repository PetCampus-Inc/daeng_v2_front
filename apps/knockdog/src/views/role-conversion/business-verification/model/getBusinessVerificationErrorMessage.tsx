import type { ReactNode } from 'react';

import { ApiError } from '@shared/api';

import {
  BUSINESS_VERIFICATION_ERROR_CODE,
  businessVerificationError,
} from '../config/businessVerificationError';

function getTemporaryErrorMessage() {
  return (
    <>
      {businessVerificationError.temporaryLine1}
      <br />
      {businessVerificationError.temporaryLine2}
    </>
  );
}

function getBusinessVerificationErrorMessage(error: unknown): ReactNode {
  if (error instanceof ApiError) {
    switch (error.code) {
      case BUSINESS_VERIFICATION_ERROR_CODE.DUPLICATE:
        return (
          <>
            {businessVerificationError.duplicateLine1}
            <br />
            {businessVerificationError.duplicateLine2}
          </>
        );
      case BUSINESS_VERIFICATION_ERROR_CODE.INVALID_FORMAT:
        return businessVerificationError.invalidFormat;
      case BUSINESS_VERIFICATION_ERROR_CODE.CLOSED_OR_SUSPENDED:
        return businessVerificationError.closedOrSuspended;
      default:
        return getTemporaryErrorMessage();
    }
  }

  return getTemporaryErrorMessage();
}

export { getBusinessVerificationErrorMessage };
